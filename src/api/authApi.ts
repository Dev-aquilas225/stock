import axiosClient from "./axiosClient";

export interface RegisterClientDto {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    description: string;
    type: "particulier" | "entreprise";
    companyName?: string;
    nif?: string;
}

export interface LoginClientDto {
    email: string;
    motDePasse: string;
    role: string;
}

export const registerClient = async (data: RegisterClientDto) => {
    const response = await axiosClient.post("auth/request/client", data);
    console.log(response.data);
    return response.data;
};

export const loginClient = async (data: LoginClientDto) => {
    const response = await axiosClient.post("auth/login/client", data);
    console.log(response.data);
    return response.data;
};
