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


def startServer(args):
    app = createApp({})
    app.run(debug=True, port=args.port)


def doFreezing(app):
    freezer = Freezer(app)
    with click.progressbar(
        freezer.freeze_yield(), item_show_func=lambda p: p.url if p else "Done!"
    ) as urls:
        for url in urls:
            pass


def freezeSite(args):
    outpath = str((Path(__file__).parent.parent / "build" / "staticsite").resolve())
    app = createApp(
        {},
        dict(
            FREEZER_DESTINATION=outpath,
            FREEZER_RELATIVE_URLS=True,
            FREEZER_IGNORE_MIMETYPE_WARNINGS=True,
            DEBUG=False,
            STATIC_SITE=True,
            STATIC_COMPILE_TIME=datetime.datetime.now(datetime.timezone.utc).strftime(
                "%Y/%m/%d %H:%M:%S"
            ),
        ),
    )
    static_commit = os.environ.get("PRODVIS_STATIC_COMMIT", default=None)
    app.config["STATIC_GIT_COMMIT"] = static_commit
    doFreezing(app)


def main():
    parser = argparse.ArgumentParser(prog="HGCAL Label Scanner")
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
