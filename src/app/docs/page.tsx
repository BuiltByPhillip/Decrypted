import Footer from "~/app/_components/Footer";
import DocsSidebar from "~/app/docs/DocsSidebar";
import CodeBlock from "~/app/docs/CodeBlock";
import DslCodeBlock from "~/app/docs/DslCodeBlock";
import FieldList from "~/app/docs/FieldList";
import { Badge } from "~/app/docs/Badge";


function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-green/30 bg-green/5 my-6 flex gap-3 rounded-xl border p-4">
      <span className="text-green mt-0.5 shrink-0 font-mono text-[11px] font-bold tracking-widest uppercase">
        note
      </span>
      <p className="text-muted text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-soft-white mt-16 mb-4 scroll-mt-24 text-2xl font-extrabold tracking-tight"
    >
      {children}
    </h2>
  );
}

function SubHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      className="text-soft-white mt-10 mb-3 scroll-mt-24 text-lg font-bold tracking-tight"
    >
      {children}
    </h3>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted mb-4 text-sm leading-7">{children}</p>
  );
}

export default function DocsPage() {
  return (
    <div className="bg-pattern min-h-screen bg-fixed">
      {/* Layout wrapper - offset for fixed header */}
      <div className="mx-auto flex max-w-7xl pt-20">
        <DocsSidebar />

        {/* Main content */}
        <main className="min-w-0 flex-1 px-8 pb-24 lg:px-16">
          {/* Page header */}
          <div className="mb-12 [animation:fade-up_0.5s_ease_forwards] opacity-0 [animation-delay:0.1s]">
            <span className="text-green mb-3 block font-mono text-[10px] tracking-[0.32em] uppercase">
              Decrypted Docs
            </span>
            <h1 className="text-soft-white mb-3 text-4xl font-extrabold tracking-tight">
              Documentation
            </h1>
            <p className="text-muted max-w-xl text-sm leading-relaxed">
              Everything you need to build interactive cryptographic protocol
              exercises with Decrypted.
            </p>

            {/* Divider */}
            <div className="border-medium mt-8 border-t" />
          </div>

          {/* ── Introduction ── */}
          <section className="[animation:fade-up_0.5s_ease_forwards] opacity-0 [animation-delay:0.2s]">
            <SectionHeading id="introduction">Introduction</SectionHeading>
            <Body>
              Decrypted is an educational framework for building interactive
              cryptographic protocol exercises. Exercise creators write
              exercises once using a simple text-based DSL, and Decrypted
              renders it into a fully interactive exercise, complete with
              drag-and-drop expression building, multiple choice, matching, and
              more.
            </Body>
            <Body>
              Teaching cryptographic protocols is hard. Textbooks show static
              diagrams; students passively read. Decrypted closes that gap by
              turning protocol definitions into exercises students can actually
              work through, making concepts like Diffie-Hellman or RSA tangible
              rather than abstract.
            </Body>
            <Callout>
              If you're an educator, start with the Quick Start guide. If you
              want to jump straight into writing exercises, head to the DSL
              Reference.
            </Callout>
          </section>

          {/* ── Quick Start ── */}
          <section>
            <SectionHeading id="quick-start">Quick Start</SectionHeading>
            <Body>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </Body>
            <CodeBlock>
              {`protocol: Diffie-Hellman Key Exchange

define:
  type: select
  generator g \elem { g, x, a, b }
  prime p \elem { p, q, r, s }

step:
  description: Alice computes her public key.
  exercise:
    type: select
    prompt: What does Alice send to Bob?
    answer: g^a \mod p
    options: { g^a \mod p, g^b \mod p, g^ab \mod p }`}
            </CodeBlock>
            <Body>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum. Sed ut perspiciatis
              unde omnis iste natus error sit voluptatem accusantium doloremque
              laudantium.
            </Body>
          </section>

          {/* ── Installation ── */}
          <section>
            <SectionHeading id="installation">Installation</SectionHeading>
            <Body>
              If you wish to install and run this project locally, then you have
              to navigate to the{" "}
              <a
                href="https://github.com/BuiltByPhillip/Decrypted"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green underline underline-offset-2 transition-opacity hover:opacity-80"
              >
                GitHub repository
              </a>
              , then run:
            </Body>
            <CodeBlock>
              {`npm install
npm run dev`}
            </CodeBlock>
          </section>

          {/* ── DSL Reference ── */}
          <section>
            <SectionHeading id="syntax-overview">
              Syntax Overview
            </SectionHeading>
            <Body>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim
              ad minima veniam, quis nostrum exercitationem ullam corporis
              suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
            </Body>

            <SectionHeading id="define-block">Define Block</SectionHeading>
            <Body>
              The define block lets you declare named roles that students assign
              symbols to before the exercises begin. Once assigned, you can
              reference any role anywhere in the protocol using {"{role}"}, and
              every description, prompt, and expression will automatically
              reflect the student's choices. This means a single exercise
              definition can present itself differently to every student, making
              abstract protocols feel concrete and personal. There are two ways
              students can assign a symbol to a role.
            </Body>
            <Badge key={"select"} label={"Multiple Choice"} />
            <CodeBlock>
              {`type: select
generator \\elem  {g, x, a, b}
prime \\elem {p, n, m, q}
alice_secret \\elem  {a, s, x}
bob_secret \\elem  {b, t, y}`}
            </CodeBlock>

            <Badge key={"construct"} label={"Drag And Drop"} />
            <CodeBlock>
              {`type: construct
variables: generator, prime, alice_secret, bob_secret`}
            </CodeBlock>
            <Callout>
              The language will not compile if the define block does not appear
              before any step blocks.
            </Callout>

            <SectionHeading id="step-block">Step Block</SectionHeading>
            <Body>
              Each exercise is split into step code blocks. One step is one
              exercise. It is required for any step to always have a
              description, but each exercise type has a set of required and
              optional fields that needs to be included for the step to compile.
            </Body>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Multiple Choice", "Drag And Drop", "Match", "Calculate"].map(
                (type) => (
                  <Badge key={type} label={type} />
                ),
              )}
            </div>
            <CodeBlock>
              {`step:
  description: Lorem ipsum description text.
  exercise:
    type: construct
    prompt: Build the expression.
    answer: a \oplus b`}
            </CodeBlock>

            <SectionHeading id="expressions">Expressions</SectionHeading>
            <Body>
              Nam libero tempore, cum soluta nobis est eligendi optio cumque
              nihil impedit quo minus id quod maxime placeat facere possimus,
              omnis voluptas assumenda est, omnis dolor repellendus.
            </Body>
          </section>

          {/* ── Exercise Types ── */}
          <section>
            <SectionHeading id="select">Multiple Choice</SectionHeading>
            <Body>
              The student is presented with a prompt and must pick the correct
              answer from a list of options.
            </Body>
            <FieldList
              required={[
                {
                  name: "type",
                  description: 'Always "select" for this exercise type.',
                },
                {
                  name: "prompt",
                  description: "The question shown to the student.",
                },
                {
                  name: "answer",
                  description: "The correct answer expression.",
                },
                {
                  name: "options",
                  description:
                    "A list of expressions the student can choose from.",
                },
              ]}
              optional={[
                {
                  name: "hint",
                  description: "A hint revealed when the student requests it.",
                },
              ]}
            />
            <DslCodeBlock label="Example">
              {`exercise:
  type: select
  prompt: Choose Alice's secret exponent {alice_secret}
  hint: Choose a random integer in the range [2, {prime}-2]
  options:
    - 1
    - 7
    - {prime}-1
    - {prime}-2
  answer: 7`}
            </DslCodeBlock>

            <SectionHeading id="construct">Drag And Drop</SectionHeading>
            <Body>
              The student builds an expression by dragging tokens from a palette
              onto a canvas.
            </Body>
            <FieldList
              required={[
                {
                  name: "type",
                  description: 'Always "construct" for this exercise type.',
                },
                {
                  name: "prompt",
                  description: "The question shown to the student.",
                },
                {
                  name: "answer",
                  description:
                    "The correct expression the student must construct.",
                },
              ]}
              optional={[
                {
                  name: "palette",
                  description:
                    "A default operator category shown in the palette. Students can still search for any operator.",
                  details: (
                    <div className="flex flex-wrap gap-2">
                      {[
                        "ARITHMETIC_OPERATORS",
                        "LOGICAL_OPERATORS",
                        "COMPARISON_OPERATORS",
                        "SET_THEORY_SYMBOLS",
                        "CRYPTOGRAPHIC_SYMBOLS",
                        "PROTOCOL_SYMBOLS",
                        "NUMBER_THEORY_SYMBOLS",
                        "QUANTIFIER_SYMBOLS",
                        "NUMBER_SET_CONSTANTS",
                      ].map((cat) => (
                        <Badge key={cat} label={cat} />
                      ))}
                    </div>
                  ),
                },
                {
                  name: "prefill",
                  description:
                    "Tokens pre-loaded onto the canvas that the student cannot remove.",
                },
                {
                  name: "hint",
                  description: "A hint revealed when the student requests it.",
                },
              ]}
            />
            <DslCodeBlock label="Example">
              {`exercise:
  type: construct
  prompt: Construct the expression for Alice to calculate her public key A
  hint: Bob uses the same expression to calculate B
  palette: ARITHMETIC_OPERATORS
  prefill: mod {prime}
  answer: {generator} ^ {alice_secret} mod {prime}`}
            </DslCodeBlock>

            <SectionHeading id="match">Match</SectionHeading>
            <Body>
              The student matches items on the left to their corresponding items
              on the right.
            </Body>
            <FieldList
              required={[
                {
                  name: "type",
                  description: 'Always "match" for this exercise type.',
                },
                {
                  name: "prompt",
                  description: "The question shown to the student.",
                },
                {
                  name: "pairs",
                  description:
                    "A set of key-value pairs the student must match together.",
                },
              ]}
              optional={[
                {
                  name: "hint",
                  description: "A hint revealed when the student requests it.",
                },
              ]}
            />
            <DslCodeBlock label="Example">
              {`exercise:
  type: match
  prompt: Match each step in the Diffie-Hellman protocol with the right formula
  hint: Remember, Alice doesn't know {bob_secret} and Bob doesn't know {alice_secret}
  pairs:
    - {generator}^{alice_secret} mod {prime} -> Alice's public key
    - {generator}^{bob_secret} mod {prime} -> Bob's public key
    - B^{alice_secret} mod {prime} -> Alice's shared secret
    - A^{bob_secret} mod {prime} -> Bob's shared secret`}
            </DslCodeBlock>

            <SectionHeading id="calculate">Calculate</SectionHeading>
            <Body>
              The student is given an expression to evaluate and must type in
              the correct result.
            </Body>
            <FieldList
              required={[
                {
                  name: "type",
                  description: 'Always "calculate" for this exercise type.',
                },
                {
                  name: "prompt",
                  description: "The question shown to the student.",
                },
                {
                  name: "answer",
                  description: "The correct numeric or symbolic result.",
                },
              ]}
              optional={[
                {
                  name: "hint",
                  description: "A hint revealed when the student requests it.",
                },
              ]}
            />
            <DslCodeBlock label="Example">
              {`exercise:
  type: calculate
  prompt: Compute the shared key when alice_secret = 4, prime = 23, generator = 5
  answer: 12`}
            </DslCodeBlock>
          </section>

          {/* ── Configuration ── */}
          <section>
            <SectionHeading id="custom-operators">
              Custom Operators
            </SectionHeading>
            <Body>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation.
            </Body>
            <CodeBlock>
              {`custom: \oplus XOR
custom: \cat Concatenation`}
            </CodeBlock>

            <SectionHeading id="roles-and-symbols">
              Roles & Symbols
            </SectionHeading>
            <Body>
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident.
            </Body>
            <Body>
              Nam libero tempore, cum soluta nobis est eligendi optio cumque
              nihil impedit quo minus id quod maxime placeat facere possimus,
              omnis voluptas assumenda est.
            </Body>
          </section>

          {/* Bottom border */}
          <div className="border-medium mt-16 border-t pt-6">
            <span className="text-medium font-mono text-[10px] tracking-wider">
              decrypted / docs
            </span>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
