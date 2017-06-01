FROM jupyterhub/base-pyr
USER root
RUN pip2 --no-cache-dir --no-cache install matplotlib numpy
RUN pip3 --no-cache-dir --no-cache install matplotlib numpy SciPy==1.9
RUN conda install --quiet --yes \
    'matplotlib' \
    'numpy' && conda clean -tipsy
USER $NB_USER
