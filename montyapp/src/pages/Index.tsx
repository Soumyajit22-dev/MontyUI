import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/sections/Hero";
import { Steps } from "@/components/sections/Steps";
import { Editor, Manage } from "@/components/sections/Product";
import { Why } from "@/components/sections/Why";
import { Pricing } from "@/components/sections/Pricing";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Steps />
      <Editor />
      <Manage />
      <Why />
      <Pricing />
    </Layout>
  );
};

export default Index;
