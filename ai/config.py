import os
import numpy as np
from utils.utils import read_json_file

FILE_PATH = os.path.dirname(os.path.abspath(__file__))

ROWS_PER_FRAME = 543
MAX_LEN = 384
CROP_LEN = MAX_LEN
NUM_CLASSES = 250
PAD = -100.0
NOSE = [1, 2, 98, 327]
LNOSE = [98]
RNOSE = [327]
LIP = [
    0,
    61,
    185,
    40,
    39,
    37,
    267,
    269,
    270,
    409,
    291,
    146,
    91,
    181,
    84,
    17,
    314,
    405,
    321,
    375,
    78,
    191,
    80,
    81,
    82,
    13,
    312,
    311,
    310,
    415,
    95,
    88,
    178,
    87,
    14,
    317,
    402,
    318,
    324,
    308,
]
LLIP = [84, 181, 91, 146, 61, 185, 40, 39, 37, 87, 178, 88, 95, 78, 191, 80, 81, 82]
RLIP = [
    314,
    405,
    321,
    375,
    291,
    409,
    270,
    269,
    267,
    317,
    402,
    318,
    324,
    308,
    415,
    310,
    311,
    312,
]

POSE = [500, 502, 504, 501, 503, 505, 512, 513]
LPOSE = [513, 505, 503, 501]
RPOSE = [512, 504, 502, 500]

REYE = [
    33,
    7,
    163,
    144,
    145,
    153,
    154,
    155,
    133,
    246,
    161,
    160,
    159,
    158,
    157,
    173,
]
LEYE = [
    263,
    249,
    390,
    373,
    374,
    380,
    381,
    382,
    362,
    466,
    388,
    387,
    386,
    385,
    384,
    398,
]

LHAND = np.arange(468, 489).tolist()
RHAND = np.arange(522, 543).tolist()

POINT_LANDMARKS = LIP + LHAND + RHAND + NOSE + REYE + LEYE  # +POSE

NUM_NODES = len(POINT_LANDMARKS)
CHANNELS = 6 * NUM_NODES
ROWS_PER_FRAME = 543

s2p_map = {
    k.lower(): v
    for k, v in read_json_file(
        os.path.join(FILE_PATH, "sign_to_prediction_index_map.json")
    ).items()
}
p2s_map = {
    v: k
    for k, v in read_json_file(
        os.path.join(FILE_PATH, "sign_to_prediction_index_map.json")
    ).items()
}


def PROMPT(sentence):
    return f"\nYou are given a sentence that are recognized by a sign language interpreter.\nUse pronouns, adverbs to complete the sentence, or rearrange the words and make something that makes sense. \nDo not include any other information in the output and return only one sentence.\n\nSentence: {sentence}\nAnswer:\n"
