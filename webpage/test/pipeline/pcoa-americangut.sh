#!/bin/bash

python process-americangut-metadata.py
python process-americangut-taxonomy.py
biom add-metadata -i ../data/raw/AG.biom -o ../data/AG.biom --sample-metadata-fp ../data/AG.txt --observation-metadata-fp ../data/AG-tax.txt --output-as-json
python pcoa.py ../data/AG.biom ../data/AG-PCOA-6D.json --dims=6 --write-readable --write-debug
