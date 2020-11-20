"""Runs server to test NL4DV queries.

Modified from the source.
Source: https://github.com/nl4dv/nl4dv

Author: Adam Coscia
Date: 11/20/2020
"""
import os
import json

from flask import Flask, jsonify, request, Blueprint, render_template, abort, send_from_directory
from jinja2 import TemplateNotFound
from nl4dv import NL4DV

app = Flask(__name__)
nl4dv_instance = None

@app.route('/init', methods=['POST'])
def init():
    global nl4dv_instance
    if nl4dv_instance is not None:
        return jsonify({"message": "NL4DV already initialized"})
    dependency_parser = request.form['dependency_parser']
    if dependency_parser == "corenlp":
        dependency_parser_config = {'name': 'corenlp', 'model': os.path.join(
            "assets", "jars", "stanford-english-corenlp-2018-10-05-models.jar"), 'parser': os.path.join("assets", "jars", "stanford-parser.jar")}
        nl4dv_instance = NL4DV(
            dependency_parser_config=dependency_parser_config, verbose=True)
    elif dependency_parser == "spacy":
        dependency_parser_config = {'name': 'spacy',
                                    'model': 'en_core_web_sm', 'parser': None}
        nl4dv_instance = NL4DV(
            dependency_parser_config=dependency_parser_config, verbose=True)
    elif dependency_parser == "corenlp-server":
        dependency_parser_config = {
            'name': 'corenlp-server', 'url': 'http://localhost:9000'}
        nl4dv_instance = NL4DV(
            dependency_parser_config=dependency_parser_config, verbose=True)
    else:
        raise ValueError('Error with Dependency Parser')
    return jsonify({"message": "NL4DV Initialized"})


@app.route('/setData', methods=['POST'])
def setData():
    global nl4dv_instance
    if nl4dv_instance is None:
        return jsonify({"message": "NL4DV NOT initialized"})
    dataset = request.form['dataset']
    if dataset is not None:
        datafile_obj = dataset.rsplit(".")
        nl4dv_instance.data_genie_instance.set_data(
            data_url=os.path.join("assets", "data", datafile_obj[0] + ".csv"))
        nl4dv_instance.data_genie_instance.set_alias_map(
            alias_url=os.path.join("assets", "aliases", datafile_obj[0] + ".json"))
        return get_dataset_meta()
    else:
        raise ValueError('Data not provided')


@app.route('/analyze_query', methods=['POST'])
def analyze_query():
    global nl4dv_instance
    if nl4dv_instance is None:
        return jsonify({"message": "NL4DV NOT initialized"})
    query = request.form['query']
    return json.dumps(nl4dv_instance.analyze_query(query, debug=True))


@app.route('/', methods=['GET'])
def application_homepage():
    try:
        return render_template('index.html')
    except TemplateNotFound:
        abort(404)


@app.route('/assets/<path:filename>')
def serveAssets(filename):
    return send_from_directory(os.path.join("assets"), filename, conditional=True)


def get_dataset_meta():
    global nl4dv_instance
    output = {
        "summary": nl4dv_instance.data_genie_instance.data_attribute_map,
        "rowCount": nl4dv_instance.data_genie_instance.rows,
        "columnCount": len(nl4dv_instance.data_genie_instance.data_attribute_map.keys())
    }
    return jsonify(output)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, threaded=True, port=7002)
