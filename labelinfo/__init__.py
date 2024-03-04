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

import os
from flask import Flask, url_for, redirect
from pathlib import Path
from urllib.parse import urljoin
import datetime

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

    return app
