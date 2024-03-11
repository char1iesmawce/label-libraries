#!/usr/bin/env bash

HGCAL_LABEL_REPO="https://github.com/UMN-CMS/HGCAL_Labeling.git"
REPO_DIR="hgcal_labeling_barcodes"


function main() {
    local output_location=$1
    if [[ -d "$REPO_DIR" ]]; then 
        cd "${REPO_DIR}/static"
        git pull
    else
        git clone "$HGCAL_LABEL_REPO" "$REPO_DIR"
        cd "${REPO_DIR}/static"
    fi
    python3 export.py --output "$output_location"
}

main "$(realpath "barcode_configuration.json")"
