# Copyright 2023 Jeremiah Mans, University of Minnesota (jmmans@umn.edu)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import argparse
import datetime
import json
import logging
import math
import os
import re
import sys
from pathlib import Path

import click
import yaml
from flask_frozen import Freezer

from . import createApp

logger = logging.getLogger(__name__)


def loadBarcodeConfiguration(path):
    path = Path(path)
    with open(path, "r") as f:
        data = json.load(f)
    return data


def startServer(args):
    data = loadBarcodeConfiguration(args.config_path)
    app = createApp(
        {"BARCODE_CONFIGURATION": data}, {"BARCODE_DECODERS_DIR": args.decoders_dir}
    )
    app.run(debug=True, port=args.port)


def doFreezing(app):
    freezer = Freezer(app, with_static_files=True)
    with click.progressbar(
        freezer.freeze_yield(), item_show_func=lambda p: p.url if p else "Done!"
    ) as urls:
        for url in urls:
            pass


def freezeSite(args):
    outpath = str((Path(__file__).parent.parent / "build" / "staticsite").resolve())
    data = loadBarcodeConfiguration(args.config_path)
    app = createApp(
        {"BARCODE_CONFIGURATION": data},
        dict(
            BARCODE_DECODERS_DIR=args.decoders_dir,
            FREEZER_DESTINATION=outpath,
            FREEZER_RELATIVE_URLS=True,
            FREEZER_IGNORE_MIMETYPE_WARNINGS=True,
            FREEZER_STATIC_IGNORE=["#*", "~*", ".*", "*~"],
            DEBUG=False,
            STATIC_SITE=True,
            STATIC_COMPILE_TIME=datetime.datetime.now(datetime.timezone.utc).strftime(
                "%Y/%m/%d %H:%M:%S"
            ),
        ),
    )
    static_commit = os.environ.get("LABELINFO_STATIC_COMMIT", default=None)
    app.config["STATIC_GIT_COMMIT"] = static_commit
    doFreezing(app)


def main():
    parser = argparse.ArgumentParser(prog="HGCAL Label Scanner")
    parser.add_argument(
        "-c",
        "--config-path",
        required=True,
        help="Path to json file containing the barcode configuration",
    )
    parser.add_argument(
        "-d",
        "--decoders-dir",
        default=None,
        type=str,
        help="Path to directory with supplementary JS decoders",
    )
    subparsers = parser.add_subparsers()
    parser_freeze = subparsers.add_parser("freeze")
    parser_freeze.set_defaults(func=freezeSite)

    parser_serve = subparsers.add_parser("serve")
    parser_serve.set_defaults(func=startServer)

    parser_serve.add_argument("-p", "--port", type=int, default=5000)
    args = parser.parse_args()

    if "func" not in args:
        parser.print_help()
        sys.exit(0)

    args.func(args)


if __name__ == "__main__":
    main()
