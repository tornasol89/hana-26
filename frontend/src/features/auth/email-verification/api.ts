import api from "@/lib/api";

export const emailVerificationApi = {
  verify: async (token: string): Promise<{ mensaje: string; email: string }> => {
    const { data } = await api.get("/email-verification/verify", { params: { token } });
    return data;
  },

  resend: async (): Promise<{ mensaje: string }> => {
    const { data } = await api.post("/email-verification/resend");
    return data;
  },

  resendPublic: async (email: string): Promise<{ mensaje: string }> => {
    const { data } = await api.post("/email-verification/resend-public", { email });
    return data;
  },
};