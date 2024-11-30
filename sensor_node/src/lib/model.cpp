#include <string.h>

void add_vectors(double *v1, double *v2, int size, double *result) {//兩陣列相加
    for(int i = 0; i < size; ++i)
        result[i] = v1[i] + v2[i];
}

void mul_vector_number(double *v1, double num, int size, double *result) {//將累加後的分數進行標準化
    for(int i = 0; i < size; ++i)
        result[i] = v1[i] * num;
}

void score(double * input, double * output) {
    double var0[2];
    double var1[2];
    double var2[2];
    double var3[2];
    double var4[2];
    double var5[2];
    double fire[2] = {0.0, 1.0};
    double unf[2] = {1.0, 0.0};

    if (input[0] <= 29.69499969482422) {
        if (input[1] <= 51.80999946594238) {
            if (input[2] <= 35.55499982833862) {
                memcpy(var5, fire, 2 * sizeof(double));
            } else {
                memcpy(var5, unf, 2 * sizeof(double));
            }
        } else {
            memcpy(var5, fire, 2 * sizeof(double));
        }
    } else {
        if (input[2] <= 58.079999923706055) {
            memcpy(var5, fire, 2 * sizeof(double));
        } else {
            if (input[2] <= 98.65500259399414) {
                if (input[0] <= 35.19499969482422) {
                    memcpy(var5, unf, 2 * sizeof(double));
                } else {
                    memcpy(var5, fire, 2 * sizeof(double));
                }
            } else {
                memcpy(var5, unf, 2 * sizeof(double));
            }
        }
    }
    double var6[2];
    if (input[2] <= 59.545000076293945) {
        memcpy(var6, fire, 2 * sizeof(double));
    } else {
        if (input[2] <= 98.65500259399414) {
            if (input[2] <= 97.6150016784668) {
                if (input[2] <= 68.34499740600586) {
                    if (input[1] <= 47.11000061035156) {
                        memcpy(var6, fire, 2 * sizeof(double));
                    } else {
                        double temp_var6[2] = {0.9166666666666666, 0.08333333333333333};
                        memcpy(var6, temp_var6, 2 * sizeof(double));
                    }
                } else {
                    if (input[0] <= 35.85499954223633) {
                        memcpy(var6, unf, 2 * sizeof(double));
                    } else {
                        memcpy(var6, fire, 2 * sizeof(double));
                    }
                }
            } else {
                memcpy(var6, fire, 2 * sizeof(double));
            }
        } else {
            memcpy(var6, unf, 2 * sizeof(double));
        }
    }
    add_vectors(var5, var6, 2, var4);
    double var7[2];
    if (input[1] <= 59.29999923706055) {
        if (input[1] <= 54.44499969482422) {
            if (input[1] <= 47.239999771118164) {
                if (input[0] <= 38.28000068664551) {
                    memcpy(var7, unf, 2 * sizeof(double));
                } else {
                    memcpy(var7, fire, 2 * sizeof(double));
                }
            } else {
                if (input[2] <= 60.28000068664551) {
                    memcpy(var7, fire, 2 * sizeof(double));
                } else {
                    if (input[2] <= 99.15999984741211) {
                        var7[0] = 0.7936507936507936;
                        var7[1] = 0.20634920634920634;
                    } else {
                        memcpy(var7, unf, 2 * sizeof(double));
                    }
                }
            }
        } else {
            if (input[2] <= 61.49499988555908) {
                memcpy(var7, fire, 2 * sizeof(double));
            } else {
                memcpy(var7, unf, 2 * sizeof(double));
            }
        }
    } else {
        if (input[1] <= 68.11999893188477) {
            if (input[0] <= 31.855000495910645) {
                if (input[1] <= 66.33499908447266) {
                    memcpy(var7, unf, 2 * sizeof(double));
                } else {
                    memcpy(var7, fire, 2 * sizeof(double));
                }
            } else {
                memcpy(var7, unf, 2 * sizeof(double));
            }
        } else {
            if (input[2] <= 49.55499839782715) {
                memcpy(var7, fire, 2 * sizeof(double));
            } else {
                memcpy(var7, unf, 2 * sizeof(double));
            }
        }
    }
    add_vectors(var4, var7, 2, var3);
    double var8[2];
    if (input[2] <= 58.079999923706055) {
        memcpy(var8, fire, 2 * sizeof(double));
    } else {
        if (input[1] <= 46.48500061035156) {
            memcpy(var8, fire, 2 * sizeof(double));
        } else {
            if (input[0] <= 37.79999923706055) {
                if (input[0] <= 35.28499984741211) {
                    memcpy(var8, unf, 2 * sizeof(double));
                } else {
                    if (input[1] <= 48.029998779296875) {
                        var8[0] = 0.96;
                        var8[1] = 0.04;
                    } else {
                        var8[0] = 0.6111111111111112;
                        var8[1] = 0.3888888888888889;
                    }
                }
            } else {
                memcpy(var8, fire, 2 * sizeof(double));
            }
        }
    }
    add_vectors(var3, var8, 2, var2);
    double var9[2];
    if (input[2] <= 58.5049991607666) {
        memcpy(var9, fire, 2 * sizeof(double));
    } else {
        if (input[1] <= 46.614999771118164) {
            if (input[0] <= 37.93000030517578) {
                memcpy(var9, unf, 2 * sizeof(double));
            } else {
                memcpy(var9, fire, 2 * sizeof(double));
            }
        } else {
            if (input[0] <= 36.244998931884766) {
                if (input[0] <= 35.28499984741211) {
                    memcpy(var9, unf, 2 * sizeof(double));
                } else {
                    if (input[0] <= 35.30000114440918) {
                        memcpy(var9, fire, 2 * sizeof(double));
                    } else {
                        memcpy(var9, unf, 2 * sizeof(double));
                    }
                }
            } else {
                if (input[2] <= 100.29500198364258) {
                    memcpy(var9, fire, 2 * sizeof(double));
                } else {
                    memcpy(var9, unf, 2 * sizeof(double));
                }
            }
        }
    }
    add_vectors(var2, var9, 2, var1);
    mul_vector_number(var1, 0.2, 2, var0);
    memcpy(output, var0, 2 * sizeof(double));
}
