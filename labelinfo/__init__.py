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

import datetime
import os
from logging.config import dictConfig
from pathlib import Path
from urllib.parse import urljoin

from flask import Flask, redirect, send_from_directory, url_for

dictConfig(
    {
        "version": 1,
        "formatters": {
            "default": {
                "format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
            }
        },
        "handlers": {
            "wsgi": {
                "class": "logging.StreamHandler",
                "stream": "ext://flask.logging.wsgi_errors_stream",
                "formatter": "default",
            }
        },
        "root": {"level": "INFO", "handlers": ["wsgi"]},
    }
)


def createApp(data, config=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        ALL_DATA=data,
        SECRET_KEY="dev",
        STATIC_SITE=False,
        STATIC_GIT_COMMIT=None,
    )

    if config is None:
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.from_mapping(config)

    from . import main_bp

    app.register_blueprint(main_bp.bp)
    app.add_url_rule("/", endpoint="main.homepage")

    decoders_dir = app.config.get("BARCODE_DECODERS_DIR", None)
    app.logger.info(f"Decoders directory is {decoders_dir}")
    if decoders_dir:
        decoders_dir = Path(decoders_dir)
        app.config["BARCODE_DECODER_FNAMES"] = list(
            x.relative_to(decoders_dir) for x in decoders_dir.rglob("*.js")
        )
        app.logger.info(
            f"Found {len(app.config['BARCODE_DECODER_FNAMES'])} decoder files."
        )

        @app.route("/decoders/<path:filename>")
        def custom_decoders(filename):
            return send_from_directory(decoders_dir.absolute(), filename)
    else:
        app.config["BARCODE_DECODER_FNAMES"] = []

    return app
