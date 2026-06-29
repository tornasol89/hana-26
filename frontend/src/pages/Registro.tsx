import Navbar from "@/components/Navbar";
import { RegistroHeader } from "@/features/auth/components/RegistroHeader";
import { RegistroForm } from "@/features/auth/components/RegistroForm";
import { BlobsDecoBackground } from "@/features/auth/components/BlobsDecoBackground";
import { LoginLink } from "@/features/auth/components/LoginLink";

const Registro = () => (
  <div className="min-h-screen bg-gradient-warm relative overflow-hidden">
    <BlobsDecoBackground />
    <Navbar />

    <div className="flex items-center justify-center min-h-screen pt-24 pb-8 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="rounded-2xl shadow-soft overflow-hidden">
          <RegistroHeader />
          <div className="bg-card px-8 pt-6 pb-8">
            <RegistroForm />
            <LoginLink />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Registro;
