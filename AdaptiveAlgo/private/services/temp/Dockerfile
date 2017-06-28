FROM jupyter/scipy-notebook
USER root
RUN pip2 --no-cache-dir --no-cache install numpy
RUN pip3 --no-cache-dir --no-cache install numpy matplotlib
USER $NB_USER
