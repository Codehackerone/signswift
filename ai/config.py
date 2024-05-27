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
NUMBER_OF_FRAMES = 30
MIN_THRESHOLD = 0.3

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


def PROMPT(text):
    return f"""
  You are given a sentence that are recognized by a sign language interpreter.
  Use pronouns, adverbs to complete the sentence, or rearrange the words and make something that makes sense. 
  Do not include any other information in the output and return only one sentence.

  Sentence: {text}
  Answer:"""


STATUS_CODES = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
}

LOGS_DIR = os.path.join(FILE_PATH, "api/logs")
