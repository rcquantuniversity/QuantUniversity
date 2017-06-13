FROM jupyter/scipy-notebook
USER root
RUN pip2 --no-cache-dir --no-cache install numpy
RUN pip3 --no-cache-dir --no-cache install matplotlib scipy
USER $NB_USER
