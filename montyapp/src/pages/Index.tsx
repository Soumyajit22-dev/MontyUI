import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/sections/Hero";
import { Steps } from "@/components/sections/Steps";
import { Editor, Manage } from "@/components/sections/Product";
import { Why } from "@/components/sections/Why";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Steps />
      <Editor />
      <Manage />
      <Why />
    </Layout>
  );
};

export default Index;
