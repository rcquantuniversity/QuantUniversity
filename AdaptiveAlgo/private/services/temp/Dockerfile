FROM jupyter/base-py27
USER root
RUN pip2 --no-cache-dir --no-cache install numpy
RUN pip3 --no-cache-dir --no-cache install SciPy==1.9
USER $NB_USER
