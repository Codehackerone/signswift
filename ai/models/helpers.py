import tensorflow as tf
from typing import Optional


def tf_nan_mean(x: tf.Tensor, axis: int = 0, keepdims: bool = False) -> tf.Tensor:
    """
    Compute the mean of a tensor, ignoring NaN values.

    Args:
        x (tf.Tensor): The input tensor.
        axis (int, optional): The axis along which to compute the mean. Defaults to 0.
        keepdims (bool, optional): Whether to keep the dimensions of the input tensor. Defaults to False.

    Returns:
        tf.Tensor: The mean of the input tensor, ignoring NaN values.
    """
    return tf.reduce_sum(
        tf.where(tf.math.is_nan(x), tf.zeros_like(x), x), axis=axis, keepdims=keepdims
    ) / tf.reduce_sum(
        tf.where(tf.math.is_nan(x), tf.zeros_like(x), tf.ones_like(x)),
        axis=axis,
        keepdims=keepdims,
    )


def tf_nan_std(
    x: tf.Tensor,
    center: Optional[tf.Tensor] = None,
    axis: int = 0,
    keepdims: bool = False,
) -> tf.Tensor:
    """
    Compute the standard deviation of a tensor, ignoring NaN values.

    Args:
        x (tf.Tensor): The input tensor.
        center (tf.Tensor, optional): The center value to subtract from the input tensor. If None, the mean of the tensor will be used. Defaults to None.
        axis (int, optional): The axis along which to compute the standard deviation. Defaults to 0.
        keepdims (bool, optional): Whether to keep the dimensions of the input tensor. Defaults to False.

    Returns:
        tf.Tensor: The standard deviation of the input tensor, ignoring NaN values.
    """
    if center is None:
        center = tf_nan_mean(x, axis=axis, keepdims=True)
    d = x - center
    return tf.math.sqrt(tf_nan_mean(d * d, axis=axis, keepdims=keepdims))
