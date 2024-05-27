import tensorflow as tf
import numpy as np
import pandas as pd
from typing import List, Optional, Callable, Dict
from models.helpers import tf_nan_mean, tf_nan_std
from config import (
    MAX_LEN,
    POINT_LANDMARKS,
    CHANNELS,
    FILE_PATH,
    NUM_CLASSES,
    ROWS_PER_FRAME,
    s2p_map,
    p2s_map,
)


class Converter(object):
    """
    A class that converts between sign names and sign indices.

    Methods:
      encoder(x: str) -> int: Encodes a sign name to its corresponding index.
      decoder(x: int) -> str: Decodes a sign index to its corresponding name.
    """

    def encoder(self, x: str) -> int:
        """
        Encodes a sign name to its corresponding index.

        Args:
          x (str): The sign name.

        Returns:
          int: The corresponding sign index.
        """
        return s2p_map.get(x.lower())

    def decoder(self, x: int) -> str:
        """
        Decodes a sign index to its corresponding name.

        Args:
          x (int): The sign index.

        Returns:
          str: The corresponding sign name.
        """
        return p2s_map.get(x)


class Preprocess(tf.keras.layers.Layer):
    def __init__(
        self,
        max_len: int = MAX_LEN,
        point_landmarks: list[int] = POINT_LANDMARKS,
        **kwargs,
    ) -> None:
        """
        Preprocess layer for input data.

        Args:
          max_len (int, optional): Maximum length of the input sequence. Defaults to MAX_LEN.
          point_landmarks (list[int], optional): List of indices of the point landmarks. Defaults to POINT_LANDMARKS.
          **kwargs: Additional keyword arguments.

        Returns:
          None
        """
        super().__init__(**kwargs)
        self.max_len = max_len
        self.point_landmarks = point_landmarks

    def call(self, inputs: tf.Tensor) -> tf.Tensor:
        """
        Perform preprocessing on the input data.

        Args:
          inputs (tf.Tensor): Input tensor.

        Returns:
          tf.Tensor: Preprocessed tensor.
        """
        if tf.rank(inputs) == 3:
            x = inputs[None, ...]
        else:
            x = inputs

        mean = tf_nan_mean(tf.gather(x, [17], axis=2), axis=[1, 2], keepdims=True)
        mean = tf.where(tf.math.is_nan(mean), tf.constant(0.5, x.dtype), mean)
        x = tf.gather(x, self.point_landmarks, axis=2)  # N,T,P,C
        std = tf_nan_std(x, center=mean, axis=[1, 2], keepdims=True)

        x = (x - mean) / std

        if self.max_len is not None:
            x = x[:, : self.max_len]
        length = tf.shape(x)[1]
        x = x[..., :2]

        dx = tf.cond(
            tf.shape(x)[1] > 1,
            lambda: tf.pad(x[:, 1:] - x[:, :-1], [[0, 0], [0, 1], [0, 0], [0, 0]]),
            lambda: tf.zeros_like(x),
        )

        dx2 = tf.cond(
            tf.shape(x)[1] > 2,
            lambda: tf.pad(x[:, 2:] - x[:, :-2], [[0, 0], [0, 2], [0, 0], [0, 0]]),
            lambda: tf.zeros_like(x),
        )

        x = tf.concat(
            [
                tf.reshape(x, (-1, length, 2 * len(self.point_landmarks))),
                tf.reshape(dx, (-1, length, 2 * len(self.point_landmarks))),
                tf.reshape(dx2, (-1, length, 2 * len(self.point_landmarks))),
            ],
            axis=-1,
        )

        x = tf.where(tf.math.is_nan(x), tf.constant(0.0, x.dtype), x)

        return x


class ECA(tf.keras.layers.Layer):
    """
    Efficient Channel Attention (ECA) layer.

    Args:
      kernel_size (int): Size of the kernel for the convolutional layer.

    Attributes:
      supports_masking (bool): Whether the layer supports masking.
      kernel_size (int): Size of the kernel for the convolutional layer.
      conv (tf.keras.layers.Conv1D): Convolutional layer.

    """

    def __init__(self, kernel_size: int = 5, **kwargs) -> None:
        super().__init__(**kwargs)
        self.supports_masking: bool = True
        self.kernel_size: int = kernel_size
        self.conv: tf.keras.layers.Conv1D = tf.keras.layers.Conv1D(
            filters=1,
            kernel_size=kernel_size,
            strides=1,
            padding="same",
            use_bias=False,
        )

    def call(self, inputs: tf.Tensor, mask: Optional[tf.Tensor] = None) -> tf.Tensor:
        nn: tf.Tensor = tf.keras.layers.GlobalAveragePooling1D()(inputs, mask=mask)
        nn: tf.Tensor = tf.expand_dims(nn, axis=-1)
        nn: tf.Tensor = self.conv(nn)
        nn: tf.Tensor = tf.squeeze(nn, axis=-1)
        nn: tf.Tensor = tf.nn.sigmoid(nn)
        nn: tf.Tensor = nn[:, None, :]
        return inputs * nn


class LateDropout(tf.keras.layers.Layer):
    """A custom Keras layer that applies dropout after a certain number of training steps.

    Args:
      rate (float): The dropout rate.
      noise_shape (Optional[tf.TensorShape], optional): The shape of the binary dropout mask that will be multiplied with the input. Defaults to None.
      start_step (int, optional): The training step at which dropout will start being applied. Defaults to 0.

    Attributes:
      supports_masking (bool): Whether the layer supports masking.
      rate (float): The dropout rate.
      start_step (int): The training step at which dropout will start being applied.
      dropout (tf.keras.layers.Dropout): The dropout layer.

    """

    def __init__(
        self,
        rate: float,
        noise_shape: Optional[tf.TensorShape] = None,
        start_step: int = 0,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.supports_masking: bool = True
        self.rate: float = rate
        self.start_step: int = start_step
        self.dropout: tf.keras.layers.Dropout = tf.keras.layers.Dropout(
            rate, noise_shape=noise_shape
        )

    def build(self, input_shape):
        super().build(input_shape)
        agg: tf.VariableAggregation = tf.VariableAggregation.ONLY_FIRST_REPLICA
        self._train_counter: tf.Variable = tf.Variable(
            0, dtype=tf.int64, aggregation=agg, trainable=False
        )

    def call(self, inputs: tf.Tensor, training: bool = False) -> tf.Tensor:
        """Applies dropout to the input tensor after a certain number of training steps.

        Args:
          inputs (tf.Tensor): The input tensor.
          training (bool, optional): Whether the model is in training mode. Defaults to False.

        Returns:
          tf.Tensor: The output tensor after applying dropout.

        """
        x: tf.Tensor = tf.cond(
            self._train_counter < self.start_step,
            lambda: inputs,
            lambda: self.dropout(inputs, training=training),
        )
        if training:
            self._train_counter.assign_add(1)
        return x


class CausalDWConv1D(tf.keras.layers.Layer):
    """
    CausalDWConv1D is a custom Keras layer that performs causal depthwise convolution on 1D input tensors.

    Args:
      kernel_size (int): The size of the convolutional kernel.
      dilation_rate (int): The dilation rate for the convolution.
      use_bias (bool): Whether to include a bias term in the convolution.
      depthwise_initializer (str): The initializer for the depthwise convolution kernel.
      name (str): The name of the layer.

    Attributes:
      causal_pad (tf.keras.layers.ZeroPadding1D): The zero-padding layer for causal padding.
      dw_conv (tf.keras.layers.DepthwiseConv1D): The depthwise convolution layer.
      supports_masking (bool): Whether the layer supports masking.
    """

    def __init__(
        self,
        kernel_size: int = 17,
        dilation_rate: int = 1,
        use_bias: bool = False,
        depthwise_initializer: str = "glorot_uniform",
        name: str = "",
        **kwargs,
    ):
        super().__init__(name=name, **kwargs)
        self.causal_pad: tf.keras.layers.ZeroPadding1D = tf.keras.layers.ZeroPadding1D(
            (dilation_rate * (kernel_size - 1), 0), name=name + "_pad"
        )
        self.dw_conv: tf.keras.layers.DepthwiseConv1D = tf.keras.layers.DepthwiseConv1D(
            kernel_size,
            strides=1,
            dilation_rate=dilation_rate,
            padding="valid",
            use_bias=use_bias,
            depthwise_initializer=depthwise_initializer,
            name=name + "_dwconv",
        )
        self.supports_masking: bool = True

    def call(self, inputs: tf.Tensor) -> tf.Tensor:
        x: tf.Tensor = self.causal_pad(inputs)
        x: tf.Tensor = self.dw_conv(x)
        return x


def Conv1DBlock(
    channel_size: int,
    kernel_size: int,
    dilation_rate: int = 1,
    drop_rate: float = 0.0,
    expand_ratio: int = 2,
    se_ratio: float = 0.25,
    activation: str = "swish",
    name: str = None,
) -> Callable[[tf.Tensor], tf.Tensor]:
    """
    Creates an efficient Conv1D block.

    Args:
      channel_size (int): The number of output channels.
      kernel_size (int): The size of the convolutional kernel.
      dilation_rate (int, optional): The dilation rate for the convolutional layer. Defaults to 1.
      drop_rate (float, optional): The dropout rate. Defaults to 0.0.
      expand_ratio (int, optional): The expansion ratio for the dense layer. Defaults to 2.
      se_ratio (float, optional): The squeeze-and-excitation ratio. Defaults to 0.25.
      activation (str, optional): The activation function to use. Defaults to "swish".
      name (str, optional): The name of the block. If not provided, a unique name will be generated.

    Returns:
      Callable[[tf.Tensor], tf.Tensor]: A function that applies the Conv1D block to the input tensor.
    """
    if name is None:
        name = str(tf.keras.backend.get_uid("mbblock"))

    # Expansion phase
    def apply(inputs: tf.Tensor) -> tf.Tensor:
        channels_in: int = tf.keras.backend.int_shape(inputs)[-1]
        channels_expand: int = channels_in * expand_ratio

        skip: tf.Tensor = inputs

        x: tf.Tensor = tf.keras.layers.Dense(
            channels_expand,
            use_bias=True,
            activation=activation,
            name=name + "_expand_conv",
        )(inputs)

        # Depthwise Convolution
        x: tf.Tensor = CausalDWConv1D(
            kernel_size,
            dilation_rate=dilation_rate,
            use_bias=False,
            name=name + "_dwconv",
        )(x)

        x: tf.Tensor = tf.keras.layers.BatchNormalization(
            momentum=0.95, name=name + "_bn"
        )(x)

        x: tf.Tensor = ECA()(x)

        x: tf.Tensor = tf.keras.layers.Dense(
            channel_size, use_bias=True, name=name + "_project_conv"
        )(x)

        if drop_rate > 0:
            x: tf.Tensor = tf.keras.layers.Dropout(
                drop_rate, noise_shape=(None, 1, 1), name=name + "_drop"
            )(x)

        if channels_in == channel_size:
            x: tf.Tensor = tf.keras.layers.add([x, skip], name=name + "_add")
        return x

    return apply


class MultiHeadSelfAttention(tf.keras.layers.Layer):
    """
    Multi-Head Self Attention layer.

    Args:
      dim (int): The dimensionality of the output space (default: 256).
      num_heads (int): The number of attention heads (default: 4).
      dropout (float): The dropout rate (default: 0).

    Attributes:
      dim (int): The dimensionality of the output space.
      scale (float): The scaling factor for the attention scores.
      num_heads (int): The number of attention heads.
      qkv (tf.keras.layers.Dense): The dense layer for computing the query, key, and value.
      drop1 (tf.keras.layers.Dropout): The dropout layer.
      proj (tf.keras.layers.Dense): The dense layer for projecting the attended values.
      supports_masking (bool): Whether the layer supports masking.

    Methods:
      call(inputs, mask=None): Performs the forward pass of the layer.

    Returns:
      tf.Tensor: The output tensor.
    """

    def __init__(
        self, dim: int = 256, num_heads: int = 4, dropout: float = 0, **kwargs
    ):
        super().__init__(**kwargs)
        self.dim: int = dim
        self.scale: float = self.dim**-0.5
        self.num_heads: int = num_heads
        self.qkv: tf.keras.layers.Dense = tf.keras.layers.Dense(3 * dim, use_bias=False)
        self.drop1: tf.keras.layers.Dropout = tf.keras.layers.Dropout(dropout)
        self.proj: tf.keras.layers.Dense = tf.keras.layers.Dense(dim, use_bias=False)
        self.supports_masking: bool = True

    def call(self, inputs: tf.Tensor, mask: Optional[tf.Tensor] = None) -> tf.Tensor:
        qkv: tf.Tensor = self.qkv(inputs)
        qkv: tf.Tensor = tf.keras.layers.Permute((2, 1, 3))(
            tf.keras.layers.Reshape(
                (-1, self.num_heads, self.dim * 3 // self.num_heads)
            )(qkv)
        )
        q, k, v = tf.split(qkv, [self.dim // self.num_heads] * 3, axis=-1)

        attn: tf.Tensor = tf.matmul(q, k, transpose_b=True) * self.scale

        if mask is not None:
            mask = mask[:, None, None, :]

        attn: tf.Tensor = tf.keras.layers.Softmax(axis=-1)(attn, mask=mask)
        attn: tf.Tensor = self.drop1(attn)

        x: tf.Tensor = attn @ v
        x: tf.Tensor = tf.keras.layers.Reshape((-1, self.dim))(
            tf.keras.layers.Permute((2, 1, 3))(x)
        )
        x: tf.Tensor = self.proj(x)
        return x


class TFLiteModel(tf.Module):
    """
    TensorFlow Lite Model for sign recognition.

    Args:
      islr_models (List[tf.keras.Model]): List of tf.keras.Model objects representing individual models.

    Attributes:
      prep_inputs (Preprocess): Preprocess object for input data preprocessing.
      islr_models (List[tf.keras.Model]): List of tf.keras.Model objects representing individual models.

    """

    def __init__(self, islr_models: List[tf.keras.Model]) -> None:
        super(TFLiteModel, self).__init__()
        self.prep_inputs: Preprocess = Preprocess()
        self.islr_models: List[tf.keras.Model] = islr_models

    @tf.function(
        input_signature=[
            tf.TensorSpec(shape=[None, 543, 3], dtype=tf.float32, name="inputs")
        ]
    )
    def __call__(self, inputs: tf.Tensor) -> Dict[str, tf.Tensor]:
        """
        Perform inference on the input data.

        Args:
          inputs (tf.Tensor): Input tensor of shape [batch_size, 543, 3].

        Returns:
          Dict[str, tf.Tensor]: Dictionary containing the output tensor.

        """
        x: tf.Tensor = self.prep_inputs(tf.cast(inputs, dtype=tf.float32))
        outputs: List[tf.Tensor] = [model(x) for model in self.islr_models]
        outputs: tf.Tensor = tf.keras.layers.Average()(outputs)[0]
        return {"outputs": outputs}


class Model(object):
    """
    A class representing a machine learning model.

    Attributes:
      model_path (str): The path to the model file.
      tflite_keras_model (TFLiteModel): The TFLite model.
      loaded (bool): Indicates whether the model is loaded or not.

    Methods:
      __init__(model_path: str) -> None: Initializes the Model object.
      __load__() -> None: Loads the model.
      TransformerBlock(dim: int = 256, num_heads: int = 4, expand: int = 4, attn_dropout: float = 0.2,
               drop_rate: float = 0.2, activation: str = "swish") -> Callable[[tf.Tensor], tf.Tensor]:
        Returns a callable function representing a transformer block.
      get_model(max_len: int = MAX_LEN, dropout_step: int = 0, dim: int = 192) -> tf.keras.Model:
        Returns the machine learning model.
      load_relevant_data_csv(data: pd.DataFrame, data_columns: list[str] = ["x", "y", "z"]) -> np.ndarray:
        Loads relevant data from a CSV file.
      predict(data: pd.DataFrame) -> tuple[str, float]:
        Makes a prediction using the model.

    """

    def __init__(self, model_path: str) -> None:
        """
        Initializes the Model object.

        Args:
          model_path (str): The path to the model file.

        """
        self.model_path = [model_path]
        self.tflite_keras_model = None
        self.loaded = False

        print("[INFO] Model initialized...")

    def __load__(self) -> None:
        """
        Loads the model.

        Raises:
          Exception: If there is an error loading the model.

        """
        print("[INFO] Loading model...")
        try:
            models = [self.get_model() for _ in self.model_path]
            for model, path in zip(models, self.model_path):
                model.load_weights(path)

            self.tflite_keras_model = TFLiteModel(islr_models=models)
            self.loaded = True
            print("[INFO] Model loaded successfully!")
        except Exception as e:
            self.loaded = False
            raise Exception(f"Error loading model: {e}")

    def TransformerBlock(
        self,
        dim: int = 256,
        num_heads: int = 4,
        expand: int = 4,
        attn_dropout: float = 0.2,
        drop_rate: float = 0.2,
        activation: str = "swish",
    ) -> Callable[[tf.Tensor], tf.Tensor]:
        """
        Returns a callable function representing a transformer block.

        Args:
          dim (int): The dimension of the transformer block.
          num_heads (int): The number of attention heads.
          expand (int): The expansion factor.
          attn_dropout (float): The dropout rate for attention layers.
          drop_rate (float): The dropout rate for other layers.
          activation (str): The activation function to use.

        Returns:
          Callable[[tf.Tensor], tf.Tensor]: The transformer block function.

        """

        def apply(inputs: tf.Tensor) -> tf.Tensor:
            x: tf.Tensor = inputs
            x: tf.Tensor = tf.keras.layers.BatchNormalization(momentum=0.95)(x)
            x: tf.Tensor = MultiHeadSelfAttention(
                dim=dim, num_heads=num_heads, dropout=attn_dropout
            )(x)
            x: tf.Tensor = tf.keras.layers.Dropout(drop_rate, noise_shape=(None, 1, 1))(
                x
            )
            x: tf.Tensor = tf.keras.layers.Add()([inputs, x])
            attn_out: tf.Tensor = x

            x: tf.Tensor = tf.keras.layers.BatchNormalization(momentum=0.95)(x)
            x: tf.Tensor = tf.keras.layers.Dense(
                dim * expand, use_bias=False, activation=activation
            )(x)
            x: tf.Tensor = tf.keras.layers.Dense(dim, use_bias=False)(x)
            x: tf.Tensor = tf.keras.layers.Dropout(drop_rate, noise_shape=(None, 1, 1))(
                x
            )
            x: tf.Tensor = tf.keras.layers.Add()([attn_out, x])
            return x

        return apply

    def get_model(
        self, max_len: int = MAX_LEN, dropout_step: int = 0, dim: int = 192
    ) -> tf.keras.Model:
        """
        Returns the machine learning model.

        Args:
          max_len (int): The maximum length of the input.
          dropout_step (int): The dropout step.
          dim (int): The dimension of the model.

        Returns:
          tf.keras.Model: The machine learning model.

        """
        inp: tf.keras.Input = tf.keras.Input((max_len, CHANNELS))
        x: tf.Tensor = inp
        ksize: int = 17
        x: tf.Tensor = tf.keras.layers.Dense(dim, use_bias=False, name="stem_conv")(x)
        x: tf.Tensor = tf.keras.layers.BatchNormalization(
            momentum=0.95, name="stem_bn"
        )(x)

        x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
        x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
        x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
        x: tf.Tensor = self.TransformerBlock(dim, expand=2)(x)

        x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
        x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
        x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
        x: tf.Tensor = self.TransformerBlock(dim, expand=2)(x)

        if dim == 384:  # for the 4x sized model
            x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
            x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
            x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
            x: tf.Tensor = self.TransformerBlock(dim, expand=2)(x)

            x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
            x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
            x: tf.Tensor = Conv1DBlock(dim, ksize, drop_rate=0.2)(x)
            x: tf.Tensor = self.TransformerBlock(dim, expand=2)(x)

        x: tf.Tensor = tf.keras.layers.Dense(dim * 2, activation=None, name="top_conv")(
            x
        )
        x: tf.Tensor = tf.keras.layers.GlobalAveragePooling1D()(x)
        x: tf.Tensor = LateDropout(0.8, start_step=dropout_step)(x)
        x: tf.Tensor = tf.keras.layers.Dense(NUM_CLASSES, name="classifier")(x)
        return tf.keras.Model(inp, x)

    def load_relevant_data_csv(
        self, data: pd.DataFrame, data_columns: list[str] = ["x", "y", "z"]
    ) -> np.ndarray:
        """
        Loads relevant data from a CSV file.

        Args:
          data (pd.DataFrame): The data to load.
          data_columns (list[str]): The columns to consider.

        Returns:
          np.ndarray: The loaded data.

        """
        n_frames = int(len(data) / ROWS_PER_FRAME)
        data = data.values.reshape(n_frames, ROWS_PER_FRAME, len(data_columns))
        return data.astype(np.float32)

    def predict(self, data: pd.DataFrame) -> tuple[str, float]:
        """
        Makes a prediction using the model.

        Args:
          data (pd.DataFrame): The data to predict on.

        Returns:
          tuple[str, float]: The model prediction and the maximum probability.

        """
        if not self.loaded:
            self.__load__()

        demo_output = self.tflite_keras_model(self.load_relevant_data_csv(data))[
            "outputs"
        ]
        output = Converter().decoder(np.argmax(demo_output.numpy(), axis=-1))
        probs = np.exp(demo_output) / np.sum(np.exp(demo_output))
        max_prob = np.max(probs)

        return output, max_prob


if __name__ == "__main__":
    csv_path = "/home/soumyajit/sign/keypoint/signswift/ai/api/dump/test_df/0.csv"
    data = pd.read_csv(csv_path, usecols=["x", "y", "z"])
    model = Model(
        model_path=FILE_PATH + "/weights/islr-fp16-192-8-seed42-foldall-last.h5"
    )
    model.__load__()
    prediction = model.predict(data)
    print(f"Prediction: {prediction}")
