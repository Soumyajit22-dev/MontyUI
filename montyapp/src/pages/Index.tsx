import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/sections/Hero";
import { Steps } from "@/components/sections/Steps";
import { Validate } from "@/components/sections/Validate";
import { Editor, Manage } from "@/components/sections/Product";
import { References } from "@/components/sections/References";
import { Why } from "@/components/sections/Why";
import { Pricing } from "@/components/sections/Pricing";
import { CallToAction } from "@/components/sections/CallToAction";

/**
 * The landing page.
 *
 * Ask, explain, then prove — in that order. The hero makes the offer in one
 * screen, the explainer lays out the three steps, and the feature sections
 * elaborate those same three in the same sequence, each around a capture of the
 * surface it describes. References sits after the editor because that is where
 * a reader first wonders where the citations come from.
 */
const Index = () => {
  return (
    <Layout>
      <Hero />
      <Steps />
      <Validate />
      <Editor />
      <References />
      <Manage />
      <Why />
      <Pricing />
      <CallToAction />
    </Layout>
  );
};

export default Index;
