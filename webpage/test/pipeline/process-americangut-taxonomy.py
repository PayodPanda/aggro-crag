import os
from biom import load_table
import pandas as pd

DATA_DIR = os.path.join(os.path.pardir, 'data')
RAW_DATA_DIR = os.path.join(DATA_DIR, 'raw')

def main():
    table = load_table(os.path.join(RAW_DATA_DIR, 'AG.biom'))
    ids = table.ids(axis='observation')
    ranks = ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species']
    taxonomy = {id_: dict(zip(ranks, table.metadata(id_, axis='observation')['taxonomy'])) for id_ in ids}
    df = pd.DataFrame.from_dict(taxonomy, orient='index')
    df = df.reindex_axis(ranks, axis=1)
    df.index.rename('#OTUID', inplace=True)
    df.to_csv(os.path.join(DATA_DIR, 'AG-tax.txt'), sep='\t')

if __name__ == '__main__':
    main()
