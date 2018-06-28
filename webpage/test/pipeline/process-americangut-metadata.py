import os
import pandas as pd

DATA_DIR = os.path.join(os.path.pardir,  'data')
RAW_DATA_DIR = os.path.join(DATA_DIR, 'raw')

def main():
    df = pd.read_table(os.path.join(RAW_DATA_DIR, 'AG.txt'),
            index_col='#SampleID',
            na_values=['no_data', 'unknown'],
            dtype={
                'GENERAL_MEDS': object,
                'MACRONUTRIENT_PCT_TOTAL': object,
                'DECEASED_PARENT': object}
            )
    # for sake of consistency, rename some columns
    df.rename(columns={
        'BarcodeSequence': 'BARCODE_SEQUENCE',
        'LinkerPrimerSequence': 'LINKER_PRIMER_SEQUENCE',
        'Description': 'DESCRIPTION'}, inplace=True)
    # coerce strings to NaN in one column (they seem meaningless or misplaced...)
    df['MACRONUTRIENT_PCT_TOTAL'] = pd.to_numeric(df['MACRONUTRIENT_PCT_TOTAL'], errors='coerce')
    df.to_csv(os.path.join(DATA_DIR, 'AG.txt'), sep='\t')

if __name__ == '__main__':
    main()
