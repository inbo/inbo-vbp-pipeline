# Inbo VBP pipeline

This repo contains all the logic used to run the data-processing pipeline for the [Flemish Biodiversity Portal (VBP)](https://natuurdata.inbo.be).
The main repository, containing the configuration and building of the micro-services can be found [here](https://github.com/inbo/vlaams-biodiversiteitsportaal).

## Structure

./terraform contains a terraform module that should suffice to install everything on an AWS environment

./lambdas contains the code for a few lambdas, used by the pipeline
