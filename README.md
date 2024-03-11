# HGCAL Label Info

This tool produces a website provides a simple method for getting basic information about an HGCAL component barcode. 


## Installing the Application

The interface runs in a basic web server. 

### Install globally

To install on the system in editable mode, just run.

```sh
python3 -m pip install -e .
```

### Using `venv`/`pip`

To create and enter a virtual environment run 

```sh
python3 -m venv env
source env/bin/activate
```

Then install the package by running 

```sh
python3 -m pip install .
```


## Running the tool

### Serving the site

The site may be served

``` sh
python3 -m labelinfo serve
```


### Freezing the site

The website may also be compiled to a collection of html files using

``` sh
python3 -m labelinfo freeze
```







