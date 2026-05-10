import Footer from "~/app/_components/Footer";
import DocsSidebar from "~/app/docs/DocsSidebar";
import DocsScrollLogo from "~/app/docs/DocsScrollLogo";
import CodeBlock from "~/app/docs/CodeBlock";
import DslCodeBlock from "~/app/docs/DslCodeBlock";
import DefineCodeBlock from "~/app/docs/DefineCodeBlock";
import FieldList from "~/app/docs/FieldList";
import { Badge } from "~/app/docs/Badge";
import { PALETTE_CATEGORIES, operatorSymbol, symbolDisplay } from "~/app/hooks/parser";
import { EL_GAMAL_EXAMPLE, DIFFIE_HELLMAN_EXAMPLE, TLS_EXAMPLE } from "~/app/docs/examples";


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

function SubSubHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h4
      id={id}
      className="text-soft-white mt-7 mb-2 scroll-mt-24 text-sm font-bold tracking-tight"
    >
      {children}
    </h4>
  );
}

function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className="text-green underline underline-offset-2 transition-opacity hover:opacity-80"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
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
      <DocsScrollLogo />
      {/* Layout wrapper - offset for fixed header */}
      <div className="mx-auto flex max-w-7xl pt-20">
        <DocsSidebar />

        {/* Main content */}
        <main className="min-w-0 flex-1 px-8 pb-24 lg:px-16">
          {/* Page header */}
          <div className="mb-12">
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
          <section>
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
              To get started building exercises, follow this quick start guide,
              as it will teach you the basics of the framework. The framework
              provides a set amount of exercises, but it brings an infinite
              amount of possibilities, because they allow much different
              behavior.
            </Body>
            <SubHeading id="understanding-the-structure">
              Understanding the structure
            </SubHeading>
            <Body>
              Exercises have to be individually inside a step. A step covers
              what the user will see on a single page. This means that multiple
              steps, e.g. 4 steps, will cover four separate pages. Once the user
              has completed all 4 steps, the user will be able to submit their
              answers, and see the final summarization page of how they did.
            </Body>
            <SubHeading id="getting-started">Getting Started</SubHeading>
            <SubSubHeading id="title">Title</SubSubHeading>
            <Body>
              To get started building exercises, you have to put in a title for
              the exercise. This is purely a display name and DOES NOT affect
              the exercises. You put the title at the start of the code.
            </Body>
            <SubSubHeading id="define">Define</SubSubHeading>
            <Body>
              The define block is where you declare the roles students assign symbols to before the exercises begin. It
              is a really powerful tool and it is important you understand and use this system.
            </Body>
            <Body>
              See the{" "}
              <DocLink href="#define-block">Define Block</DocLink>{" "}
              section for full details.
            </Body>
            <SubSubHeading id="step">Step</SubSubHeading>
            <CodeBlock label="Example">
              {`title: Diffie-Hellman Key Exchange

define:
  type: select
  generator \\elem { g, x, a, b }
  prime \\elem { p, q, r, s }

step:
  description: Alice computes her public key.
  exercise:
    type: select
    prompt: What does Alice send to Bob?
    answer: g^a \mod p
    options: { g^a \mod p, g^b \mod p, g^ab \mod p }`}
            </CodeBlock>
            <Body>
              Each step is rendered with the description at the top of the page and,
              if an exercise is defined, it will appear below it. Each step takes up
              an entire page. This means that if the exercise is omitted from the step,
              the page will only contain a description, which is useful for information
              between exercises. See the{" "}
              <DocLink href="#select">exercise types</DocLink>{" "}
              section for the fields each type accepts.
            </Body>
          </section>

          {/* ── Installation ── */}
          <section>
            <SectionHeading id="installation">Installation</SectionHeading>
            <Body>
              If you wish to install and run this project locally, then you have
              to navigate to the{" "}
              <DocLink href="https://github.com/BuiltByPhillip/Decrypted">GitHub repository</DocLink>
              , then run:
            </Body>
            <CodeBlock label="Terminal">
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
              A Decrypted exercise is made up of four top-level blocks that must
              appear in this order: <code>title</code>, <code>define</code>,{" "}
              <code>custom</code>, and <code>step</code>. Only <code>title</code>{" "}
              and at least one <code>step</code> are required - the others are
              optional. Fields inside a block are indented with two spaces.
            </Body>
            <Body>
              The <code>title</code> is a display name for the exercise. It has
              no effect on the exercises themselves, but it will be visible to
              you and anyone you share it with.
            </Body>
            <Body>
              The <code>define</code> block declares the roles that students
              assign symbols to before the exercises begin. There are two
              variants: <code>select</code> (students pick from a fixed set) and{" "}
              <code>construct</code> (students build their own symbol via
              drag-and-drop). See the{" "}
              <DocLink href="#define-block">Define Block</DocLink> section for
              full details.
            </Body>
            <Body>
              The <code>custom</code> block lets you define your own operators
              if the built-in set does not cover what you need. See{" "}
              <DocLink href="#custom-operators">Custom Operators</DocLink> for a
              full guide.
            </Body>
            <Body>
              One or more <code>step</code> blocks define the actual exercises.
              Each step occupies its own page and contains a description and an
              optional exercise.
            </Body>
            <Body>
              Role references are written as{" "}<code>{"{role_name}"}</code> and
              can appear in descriptions, prompts, and expressions. When a
              student has assigned a symbol to a role, every occurrence of that
              reference is automatically replaced with their chosen symbol. This
              only works if a <code>define</code> block is present. See{" "}
              <DocLink href="#roles-and-symbols">Roles &amp; Symbols</DocLink>{" "}
              for more detail.
            </Body>
            <CodeBlock label="Skeleton">
              {`title: Diffie-Hellman Key Exchange

define:
  type: select
  generator \\elem {g, h, k}
  prime \\elem {p, q, r}

custom:
  operator:
    name: myop
    type: BINARY
    precedence: 5

step:
  description: Alice uses {generator} as the base for her calculation.
  exercise:
    type: select
    prompt: What is the base used with {prime}?
    options:
      - {generator}
      - {prime}
    answer: {generator}`}
            </CodeBlock>

            <SectionHeading id="define-block">Define Block</SectionHeading>
            <Body>
              The define block is where you declare the named roles that students
              assign symbols to before the exercises begin. Once a student has made
              their choices, you can reference any role throughout the protocol
              using {"{role}"}, in descriptions, prompts, and expressions alike.
              This lets a single exercise definition feel personal to each student,
              since every occurrence of {"{role}"} is automatically replaced with
              the symbol they picked.
            </Body>
            <SubHeading id="how-to-use">Variants</SubHeading>
            <Badge key={"select"} label={"Multiple Choice"} />
            <Body>
              With the multiple choice variant, each role is paired with a fixed set
              of symbols the student can choose from. This is the simpler of the two
              variants and is a good default, keeping the student focused without
              overwhelming them with options.
            </Body>
            <FieldList
              required={[
                { name: "type", description: 'Always "select" for this define type.' },
                { name: "role \\elem { ... }", description: "Declares a role and the set of symbols the student can pick from. Add one line per role." },
              ]}
              optional={[]}
            />
            <DefineCodeBlock label="Example - Multiple Choice">
              {`type: select
generator \\elem  {g, h, k}
prime \\elem {p, n, m, q}
alice_secret \\elem  {a, s, x}
bob_secret \\elem  {b, t, y}`}
            </DefineCodeBlock>

            <Badge key={"construct"} label={"Drag And Drop"} />
            <Body>
              With the drag and drop variant, students build their own symbol for
              each role using a palette of tokens, without being limited to a
              predefined set. This gives more flexibility, but also more room for
              error, so consider whether that freedom is appropriate for your
              exercise before choosing this variant over multiple choice.
            </Body>
            <FieldList
              required={[
                { name: "type", description: 'Always "construct" for this define type.' },
                { name: "variables", description: "A comma-separated list of role names the student will assign symbols to via drag and drop." },
              ]}
              optional={[]}
            />
            <DefineCodeBlock label="Example - Drag And Drop">
              {`type: construct
variables: generator, prime, alice_secret, bob_secret`}
            </DefineCodeBlock>
            <Callout>
              The define block must appear before any step blocks, or the protocol
              will fail to compile.
            </Callout>
            <Callout>
              Each symbol must belong to exactly one role. A symbol that appears
              in two different role definitions will cause a compile error. For
              example, if {`generator`} already contains {`g`}, no other role may
              also list {`g`} as a possible value. This applies to both the select
              and construct variants - in construct exercises, students will be
              prevented from assigning a symbol that is already assigned to
              another role.
            </Callout>

            <SectionHeading id="step-block">Step Block</SectionHeading>
            <Body>
              Each exercise is split into step code blocks. One step is one
              exercise. It is required for any step to always have a
              description, but each exercise type has a set of required and
              optional fields that needs to be included for the step to compile.
            </Body>
            <FieldList
              required={[
                { name: "description", description: "The text shown at the top of the step page. Required for every step." },
              ]}
              optional={[
                { name: "exercise", description: "The exercise block for this step. If omitted, the step renders as a description-only page." },
              ]}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {["Multiple Choice", "Drag And Drop", "Match", "Calculate"].map(
                (type) => (
                  <Badge key={type} label={type} />
                ),
              )}
            </div>
            <CodeBlock label="Example">
              {`step:
  description: Lorem ipsum description text.
  exercise:
    type: construct
    prompt: Build the expression.
    answer: a \oplus b`}
            </CodeBlock>

            <SectionHeading id="expressions">Expressions</SectionHeading>
            <Body>
              An expression is any valid combination of values, variables, and
              operators, for example <code>g ^ a mod p</code> or{" "}
              <code>A \xor B</code>. Expressions are used in the{" "}
              <code>answer</code>, <code>options</code>, <code>pairs</code>, and{" "}
              <code>prefill</code> fields. Role references (e.g.{" "}
              <code>{"{generator}"}</code>) are also valid inside expressions and
              are substituted with the student's chosen symbol at runtime. See{" "}
              <DocLink href="#roles-and-symbols">Roles &amp; Symbols</DocLink>{" "}
              for details.
            </Body>
            <SubHeading id="built-in-operators">Built-in Operators</SubHeading>
            <Body>
              Operators that are standard keyboard characters are written
              directly. Operators that require a special symbol are written with
              a backslash prefix followed by their name (e.g.{" "}
              <code>\xor</code> renders as ⊕). All built-in operators are
              grouped by category below. If you need an operator that is not
              listed, you can define your own - see{" "}
              <DocLink href="#custom-operators">Custom Operators</DocLink>.
            </Body>
            <div className="mb-4 flex flex-col gap-3">
              {Object.keys(PALETTE_CATEGORIES).map((name) => (
                <div key={name} className="flex items-center gap-3">
                  <Badge label={name} />
                  <div className="flex flex-wrap gap-1">
                    {PALETTE_CATEGORIES[name]!.map((item) => {
                      const op = "op" in item ? item.op : "";
                      const display =
                        { ...operatorSymbol, ...symbolDisplay }[op] ?? op;
                      return (
                        <span
                          key={op}
                          className="border-medium text-muted rounded border px-1.5 py-0.5 font-mono text-[11px]"
                          title={op}
                        >
                          {display}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <SubHeading id="operator-precedence">Operator Precedence</SubHeading>
            <Body>
              When an expression contains multiple operators, higher-precedence
              operators bind more tightly. The precedence order from highest to
              lowest is:
            </Body>
            <div className="mb-4 overflow-hidden rounded-xl border border-[#2a2f3a]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2f3a] bg-[rgba(28,33,41,0.6)]">
                    <th className="text-muted px-4 py-2 text-left font-mono text-[11px] font-semibold tracking-widest uppercase">Precedence</th>
                    <th className="text-muted px-4 py-2 text-left font-mono text-[11px] font-semibold tracking-widest uppercase">Operators</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2f3a]">
                  {[
                    ["Highest (5)", "^"],
                    ["4", "*, /, mod"],
                    ["3", "+, -"],
                    ["2", "<, >, =, and all \\backslash symbols"],
                    ["Lowest (1)", "and, or"],
                  ].map(([level, ops]) => (
                    <tr key={level} className="bg-[rgba(34,40,49,0.4)]">
                      <td className="text-muted px-4 py-2 text-[12px]">{level}</td>
                      <td className="text-green px-4 py-2 font-mono text-[12px]">{ops}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Body>
              For example, <code>g ^ a mod p</code> is parsed as{" "}
              <code>(g ^ a) mod p</code> because <code>^</code> has higher
              precedence than <code>mod</code>. Use parentheses to override the
              default order when needed.
            </Body>
            <SubHeading id="commutativity">Commutativity</SubHeading>
            <Body>
              When checking a student's answer, Decrypted treats the following
              operators as commutative: <code>+</code>, <code>*</code>,{" "}
              <code>and</code>, <code>or</code>, and <code>=</code>. This means
              that if the correct answer is <code>a + b</code>, a student who
              writes <code>b + a</code> will still be marked correct. You do not
              need to do anything to enable this - it is applied automatically
              for those operators.
            </Body>
          </section>

          {/* ── Exercise Types ── */}
          <section>
            <Callout>
              The <code>type</code> field must always be the first field inside
              an <code>exercise</code> block. The parser uses it to validate
              other fields, so declaring <code>prompt</code> or any other field
              before <code>type</code> will throw an error.
            </Callout>
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
            <Callout>
              A select exercise supports a maximum of 6 options. The parser
              will throw an error if more than 6 options are provided.
            </Callout>

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
                    <div className="flex flex-col gap-3">
                      {Object.keys(PALETTE_CATEGORIES).map((name) => (
                        <div key={name} className="flex items-center gap-3">
                          <Badge label={name} />
                          <div className="flex flex-wrap gap-1">
                            {PALETTE_CATEGORIES[name]!.map((item) => {
                              const op = "op" in item ? item.op : "";
                              const display =
                                { ...operatorSymbol, ...symbolDisplay }[op] ??
                                op;
                              return (
                                <span
                                  key={op}
                                  className="border-medium text-muted rounded border px-1.5 py-0.5 font-mono text-[11px]"
                                  title={op}
                                >
                                  {display}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  name: "prefill",
                  description:
                    "Tokens pre-loaded onto the canvas that the student cannot remove. Prefill tokens must appear in the answer, and in the same left-to-right order as they do in the answer expression.",
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
  palette: ARITHMETIC_OPERATORS, CRYPTOGRAPHIC_SYMBOLS
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
              If the built-in operator set does not cover what your protocol
              needs, you can define your own. Custom operators are declared in
              a <code>custom:</code> block and can be used anywhere an
              expression is valid: answers, options, and prefill.
            </Body>
            <FieldList
              required={[
                {
                  name: "name",
                  description:
                    "The identifier used in expressions. Written exactly as-is - for example, name: HASH means you write HASH x in an expression. Must not conflict with any built-in operator name (checked case-insensitively).",
                },
                {
                  name: "type",
                  description:
                    'Either "BINARY" (two operands) or "UNARY" (one operand). Controls how the operator is parsed and how many operands it takes.',
                },
                {
                  name: "precedence",
                  description:
                    "A non-negative integer controlling how tightly the operator binds. Higher numbers bind more tightly. Uses the same scale as built-in operators - click to expand.",
                  details: (
                    <div className="overflow-hidden rounded-xl border border-[#2a2f3a]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#2a2f3a] bg-[rgba(28,33,41,0.6)]">
                            <th className="text-muted px-3 py-2 text-left font-mono text-[11px] font-semibold tracking-widest uppercase">Value</th>
                            <th className="text-muted px-3 py-2 text-left font-mono text-[11px] font-semibold tracking-widest uppercase">Built-in operators at this level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2f3a]">
                          {[
                            ["5", "^ (strongest)"],
                            ["4", "*, /, mod"],
                            ["3", "+, -"],
                            ["2", "<, >, =, \\backslash symbols (\\elem, \\xor, …)"],
                            ["1", "and, or"],
                          ].map(([level, ops]) => (
                            <tr key={level} className="bg-[rgba(34,40,49,0.4)]">
                              <td className="text-muted px-3 py-2 font-mono text-[12px]">{level}</td>
                              <td className="text-green px-3 py-2 font-mono text-[12px]">{ops}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ),
                },
              ]}
              optional={[
                {
                  name: "commutative",
                  description:
                    'Whether a OP b and b OP a are treated as equal when checking answers. Defaults to false. Set to "true" to enable - the operator will then behave like + or * when evaluating student answers.',
                },
              ]}
            />
            <CodeBlock label="Example">
              {`custom:
  operator:
    name: HASH
    type: UNARY
    precedence: 6
  operator:
    name: SET
    type: BINARY
    commutative: true
    precedence: 3`}
            </CodeBlock>
            <Body>
              Once defined, custom operators are written directly by name in
              expressions. Binary operators are infix (<code>a SET b</code>),
              and unary operators are prefix (<code>HASH x</code>). They are
              also automatically added to the palette in construct exercises,
              so students can drag them in without any extra configuration.
            </Body>
            <Callout>
              Custom operator names tokenize as plain identifiers, not backslash
              symbols. This means a name like <code>HASH</code> is written as{" "}
              <code>HASH x</code> in the DSL, not <code>\HASH x</code>. The
              name must be unique and must not match any built-in operator
              (e.g. <code>mod</code>, <code>xor</code>, <code>forall</code>).
            </Callout>

            <SectionHeading id="roles-and-symbols">
              Roles & Symbols
            </SectionHeading>
            <Body>
              A role reference is written as <code>{"{role_name}"}</code> and
              acts as a placeholder that is replaced with the student's chosen
              symbol at runtime. Role references can appear anywhere in the code.
            </Body>
            <Body>
              Once a student has assigned a symbol to a role in the define
              step, every <code>{"{role_name}"}</code> occurrence throughout
              the exercise is replaced with that symbol. This means a single
              exercise definition can feel personalized to each student, since
              their chosen symbols appear consistently everywhere.
            </Body>
            <DslCodeBlock label="Example">
              {`step:
  description: Alice chooses her secret {alice_secret} and computes her public key.
  exercise:
    type: construct
    prompt: Build the formula Alice uses with {generator} and {prime}
    hint: The exponent is {alice_secret}
    answer: {generator} ^ {alice_secret} mod {prime}`}
            </DslCodeBlock>
            <Callout>
              Every role reference used anywhere in the exercise must be
              declared in the <code>define:</code> block. Using a role name
              that has not been defined - in a prompt, hint, or expression -
              will cause a parse error.
            </Callout>
          </section>

          {/* ── Examples ── */}
          <section>
            <SectionHeading id="examples">Examples</SectionHeading>
            <Body>
              The following are complete, copy-paste-ready exercises for two
              foundational cryptographic protocols. Each example uses multiple
              exercise types across several steps to guide students through the
              full protocol from key generation to the final computation.
            </Body>

            <SubHeading id="example-diffie-hellman">Diffie-Hellman Key Exchange</SubHeading>
            <Body>
              A five-step exercise that walks students through the Diffie-Hellman
              key exchange protocol: agreeing on public parameters, computing
              public keys, exchanging them, and deriving the shared secret. The
              final step uses concrete numbers to verify understanding.
            </Body>
            <CodeBlock label="Full Example">
              {DIFFIE_HELLMAN_EXAMPLE}
            </CodeBlock>

            <SubHeading id="example-elgamal">El-Gamal Encryption</SubHeading>
            <Body>
              A five-step exercise covering the El-Gamal encryption scheme: key
              generation, computing both ciphertext components during encryption,
              recovering the shared secret during decryption, and finally
              recovering the plaintext.
            </Body>
            <CodeBlock label="Full Example">
              {EL_GAMAL_EXAMPLE}
            </CodeBlock>

            <SubHeading id="example-tls">TLS Handshake (Key Exchange)</SubHeading>
            <Body>
              A five-step exercise walking students through the ECDH-based key
              exchange at the heart of TLS: computing each party's public key
              share, deriving the pre-master secret independently on both sides,
              and verifying the result with concrete numbers.
            </Body>
            <CodeBlock label="Full Example">
              {TLS_EXAMPLE}
            </CodeBlock>
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
