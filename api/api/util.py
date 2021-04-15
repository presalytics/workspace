import typing
import presalytics
import presalytics.lib
import presalytics.lib.util


def dict_to_camelCase(dct: typing.Dict):
    tmp = dict()
    for k, v in dct.items():
        val = v
        if isinstance(v, dict):
            val = dict_to_camelCase(v)
        key = presalytics.lib.util.to_camel_case(k)
        tmp[key] = val
    return tmp
