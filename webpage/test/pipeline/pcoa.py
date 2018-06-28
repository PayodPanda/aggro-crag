import click
import os
import json
from skbio.diversity import beta_diversity
from skbio.stats.ordination import pcoa
from biom import load_table
import pandas as pd

@click.command()
@click.option('--verbose', is_flag=True, help="Print verbose messages.")
@click.option('--write-debug', is_flag=True, default=False, help="Write a small version of final file for debugging.")
@click.option('--write-readable', is_flag=True, default=False, help="Write a human-readable version of final file.")
@click.option('--dims', type=int, help="Truncate number of dimensions returned.")
@click.argument('input')
@click.argument('output')
def principal_coordinates(verbose, write_debug, write_readable, dims, input, output):
    """Perform principal coordinate analysis (PCoA) on Bray-Curtis 
    distance matrix calculated from a BIOM Table."""
    
    # Load table
    if verbose:
        click.echo("Loading BIOM Table at {0}.".format(input))
    table = load_table(input)
    data = table.matrix_data.todense().transpose().astype(int)
    ids = table.ids(axis='sample')
    metadata_dict = {_id: table.metadata(_id, axis='sample') for _id in ids}
    metadata = pd.DataFrame.from_dict(metadata_dict, orient='index')
    
    # Calculate distance matrix
    if verbose:
        click.echo("Calculating distance matrix.")
    dm = beta_diversity('braycurtis', data, ids)
    
    # Perform PCoA
    if verbose:
        click.echo("Performing principal coordinate analysis on distance matrix.")
    pc = pcoa(dm)
    
    # Format PCoA results
    if not dims:
        dims = pc.samples.shape[1]
    coords = pc.samples.iloc[:, 0:dims]
    samples = pd.concat([coords, metadata], axis=1).transpose()
    proportion_explained = pc.proportion_explained.iloc[0:dims]
    pc_properties = {
        pc: {
            'proportion_explained': proportion_explained[pc], 
            'min': coords[pc].min(),
            'max': coords[pc].max()
            }
        for pc in coords
        }
    results = {
        'samples': samples,
        'pc_properties': pc_properties
        }

    # Write results to JSON file(s)
    if verbose:
        click.echo("Writing final PCoA file to {0}.".format(output))
    with open(output, 'w') as f:
        json.dump(results, f, default=lambda df: json.loads(df.to_json()))
    if write_readable:
        output_name, output_ext = os.path.splitext(output)
        filename = "{0}-readable{1}".format(output_name, output_ext)
        if verbose:
            click.echo("Writing human-readable (non-minified) version to {0}.".format(filename))
        with open(filename, 'w') as f:
            json.dump(results, f, indent=4, sort_keys=True, default=lambda df: json.loads(df.to_json()))
    if write_debug:
        output_name, output_ext = os.path.splitext(output)
        filename = "{0}-debug{1}".format(output_name, output_ext)
        if verbose:
            click.echo("Writing small version for debugging to {0}.".format(filename))
        results = {
                'samples': samples.iloc[:, 0:min(10, samples.shape[1])],
                'pc_properties': pc_properties
            }
        with open(filename, 'w') as f:
            json.dump(results, f, indent=4, sort_keys=True, default=lambda df: json.loads(df.to_json()))
    if verbose:
        click.echo("Done!")

if __name__ == '__main__':
    principal_coordinates()
