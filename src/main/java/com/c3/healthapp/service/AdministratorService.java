package com.c3.healthapp.service;

public interface AdministratorService {
    void deleteUserData(String username);

    void deleteUserRespirationData(String username);

    void deleteUserGripStrengthData(String username);

    void deleteUserHeartRateData(String username);

    void deleteUserWeightData(String username);
}
