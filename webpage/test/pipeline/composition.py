import click
import os
from biom import load_table
import pandas as pd

@click.command()
@click.option('--verbose', is_flag=True, help="Print verbose messages.")
@click.option('--rank', default='phylum', help="Taxonomic rank on which to collapse the OTU data.")
@click.option('--variable', help="Categorical variable on which to group the samples.")
@click.argument('input')
@click.argument('output')
def composition(verbose, rank, variable, input, output):
    """Get OTU composition at rank level grouped on variable from a BIOM Table."""
    
    # Load table
    if verbose:
        click.echo("Loading BIOM Table at {0}.".format(input))
    table = load_table(input)
    
    # Collapse OTUs by rank
    rank_title = rank.title()
    if verbose:
        click.echo("Collapsing OTU table by taxonomic rank: {0}.".format(rank_title))
    by_rank = lambda id_, md: md[rank_title]
    table = table.collapse(by_rank, axis='observation')    

    # Group samples by variable
    if verbose:
        click.echo("Collapsing OTU table by variable: {0}.".format(variable))
    by_variable = lambda id_, md: md[variable]
    table = table.collapse(by_variable, axis='sample')
    table.norm(axis='sample', inplace=True)
    df = pd.DataFrame(data=table.matrix_data.todense().transpose(),
                      index=table.ids(axis='sample'),
                      columns=table.ids(axis='observation'))
    df.index.rename('variable', inplace=True)
    df.to_csv(output)

if __name__ == '__main__':
    composition()
