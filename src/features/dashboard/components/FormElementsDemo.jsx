// import React from 'react'

// const FormElementsDemo = () => {
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default FormElementsDemo

import { useEffect, useRef, useState } from "react";

/* =========================================================
   Small helpers
========================================================= */

const VARIANTS = ["primary", "secondary", "success", "danger", "warning"];

const SIZES = [
  { cls: "btn-lg", label: "Large" },
  { cls: "btn", label: "Default" },
  { cls: "btn-sm", label: "Small" },
  { cls: "btn-xs", label: "Extra small" },
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H9v4a1 1 0 1 1-2 0V9H3a1 1 0 0 1 0-2h4V3a1 1 0 0 1 1-1Z" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="10" cy="10" r="8" />
    <path d="M10 9v5M10 6.5v.01" strokeLinecap="round" />
  </svg>
);

/* A titled card with a live preview and the class names that produce it */
function Block({ title, description, code, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      <div className="mt-4">{children}</div>
      {code && (
        <pre className="thin-scrollbar mt-4 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-300">
          <code>{code}</code>
        </pre>
      )}
    </section>
  );
}

/* Label + control + hint/error, with aria wiring. `children` receives the props to spread. */
function Field({ id, label, hint, error, required, children }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children({
        id,
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": describedBy,
      })}
      {error ? (
        <p id={`${id}-error`} className="form-error" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="form-hint">{hint}</p>
      ) : null}
    </div>
  );
}

function Switch({ id, label, ...rest }) {
  return (
    <div className="flex items-center gap-3">
      <div className="form-switch">
        <input type="checkbox" id={id} className="sr-only" {...rest} />
        <label htmlFor={id}>
          <span aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </label>
      </div>
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </div>
  );
}

/* =========================================================
   Interactive mini demos
========================================================= */

function LoadingDemo({ variant = "primary" }) {
  const [loading, setLoading] = useState(false);
  const run = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };
  return (
    <button
      className={`btn btn-${variant} ${loading ? "btn-loading" : ""}`}
      onClick={run}
      aria-busy={loading}
    >
      {loading ? "Saving" : "Click to load"}
    </button>
  );
}

function SelectAllDemo() {
  const [items, setItems] = useState({ a: true, b: false, c: true });
  const ref = useRef(null);
  const values = Object.values(items);
  const all = values.every(Boolean);
  const some = values.some(Boolean);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = some && !all;
  }, [some, all]);

  const toggleAll = (checked) =>
    setItems(Object.fromEntries(Object.keys(items).map((k) => [k, checked])));

  return (
    <div className="space-y-1">
      <label className="form-check">
        <input
          ref={ref}
          type="checkbox"
          className="form-checkbox"
          checked={all}
          onChange={(e) => toggleAll(e.target.checked)}
        />
        <span className="font-medium">Select all</span>
      </label>
      <div className="ml-7 space-y-1">
        {Object.entries(items).map(([k, v]) => (
          <label key={k} className="form-check">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={v}
              onChange={(e) => setItems((i) => ({ ...i, [k]: e.target.checked }))}
            />
            <span>Option {k.toUpperCase()}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   TAB 1: BUTTONS
========================================================= */

function ButtonsTab() {
  return (
    <div className="space-y-6">
      <Block
        title="Solid variants"
        description="Use btn plus one variant. Primary is the main action on a screen."
        code={`<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-danger">Danger</button>
<button className="btn btn-warning">Warning</button>`}
      >
        <div className="flex flex-wrap gap-3">
          {VARIANTS.map((v) => (
            <button key={v} className={`btn btn-${v}`}>{cap(v)}</button>
          ))}
        </div>
      </Block>

      <Block
        title="Outline variants"
        description="Lower emphasis than solid. Good for secondary actions next to a solid button."
        code={`<button className="btn btn-outline-primary">Primary</button>
<button className="btn btn-outline-danger">Danger</button>`}
      >
        <div className="flex flex-wrap gap-3">
          {VARIANTS.map((v) => (
            <button key={v} className={`btn btn-outline-${v}`}>{cap(v)}</button>
          ))}
        </div>
      </Block>

      <Block
        title="Neutral and low emphasis"
        description="Light for Cancel, Ghost for toolbars, Link for inline actions."
        code={`<button className="btn btn-light">Light</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-link">Link</button>`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-light">Light</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-link">Link</button>
        </div>
      </Block>

      <Block
        title="Sizes by variant"
        description="Pick one size class (btn-lg, btn, btn-sm, btn-xs) and one variant."
        code={`<button className="btn-lg btn-primary">Large</button>
<button className="btn btn-primary">Default</button>
<button className="btn-sm btn-primary">Small</button>
<button className="btn-xs btn-primary">Extra small</button>`}
      >
        <div className="thin-scrollbar space-y-3 overflow-x-auto pb-2">
          {SIZES.map((s) => (
            <div key={s.cls} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-slate-500 dark:text-slate-400">{s.label}</span>
              {VARIANTS.map((v) => (
                <button key={v} className={`${s.cls} btn-${v}`}>{cap(v)}</button>
              ))}
            </div>
          ))}
        </div>
      </Block>

      <Block
        title="States"
        description="Disabled works on buttons (disabled) and on links (aria-disabled). Loading shows a spinner and blocks clicks."
        code={`<button className="btn btn-primary" disabled>Disabled</button>
<a href="#" className="btn btn-primary" aria-disabled="true">Disabled link</a>
<button className="btn btn-primary btn-loading">Saving</button>`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {VARIANTS.map((v) => (
              <button key={v} className={`btn btn-${v}`} disabled>{cap(v)}</button>
            ))}
            <a href="#showcase" className="btn btn-primary" aria-disabled="true" tabIndex={-1}>
              Disabled link
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn btn-success btn-loading">Saving</button>
            <button className="btn btn-danger btn-loading">Deleting</button>
            <LoadingDemo />
            <span className="text-xs text-slate-500 dark:text-slate-400">Try the last one</span>
          </div>
        </div>
      </Block>

      <Block
        title="With icons"
        description="Icons sit inside the button and are spaced automatically. Icon-only buttons need an aria-label."
        code={`<button className="btn btn-primary"><PlusIcon /> Add item</button>
<button className="btn btn-light">Next <ArrowIcon /></button>
<button className="btn btn-icon btn-secondary" aria-label="Add"><PlusIcon /></button>`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary"><PlusIcon /> Add item</button>
          <button className="btn btn-light">Next <ArrowIcon /></button>
          <button className="btn btn-outline-success"><PlusIcon /> Create</button>
          <button className="btn btn-icon btn-secondary" aria-label="Add"><PlusIcon /></button>
          <button className="btn-sm btn-icon btn-light" aria-label="Add small"><PlusIcon /></button>
          <button className="btn-lg btn-icon btn-primary" aria-label="Add large"><PlusIcon /></button>
        </div>
      </Block>

      <Block
        title="Full width and as a link"
        description="btn-block fills its container. Classes work on anchors too."
        code={`<button className="btn btn-primary btn-block">Continue</button>
<a href="/pricing" className="btn btn-outline-primary">View pricing</a>`}
      >
        <div className="max-w-sm space-y-3">
          <button className="btn btn-primary btn-block">Continue</button>
          <button className="btn btn-light btn-block">Back</button>
        </div>
        <div className="mt-4 flex gap-3">
          <a href="#showcase" className="btn btn-outline-primary">View pricing</a>
          <a href="#showcase" className="btn btn-link">Learn more</a>
        </div>
      </Block>
    </div>
  );
}

/* =========================================================
   TAB 2: FIELDS
========================================================= */

const TEXT_INPUTS = [
  { id: "t-text", label: "Text", type: "text", placeholder: "Ada Lovelace" },
  { id: "t-email", label: "Email", type: "email", placeholder: "name@example.com" },
  { id: "t-pass", label: "Password", type: "password", placeholder: "At least 8 characters" },
  { id: "t-search", label: "Search", type: "search", placeholder: "Search projects" },
  { id: "t-number", label: "Number", type: "number", placeholder: "0" },
  { id: "t-date", label: "Date", type: "date" },
  { id: "t-time", label: "Time", type: "time" },
  { id: "t-url", label: "Website", type: "url", placeholder: "https://" },
];

function FieldsTab() {
  const [notify, setNotify] = useState(true);

  return (
    <div className="space-y-6">
      <Block
        title="Input types"
        description="Every type uses the same form-input class."
        code={`<label htmlFor="email" className="form-label">Email</label>
<input id="email" type="email" className="form-input" placeholder="name@example.com" />`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {TEXT_INPUTS.map(({ id, label, ...rest }) => (
            <Field key={id} id={id} label={label}>
              {(a) => <input {...a} {...rest} className="form-input" />}
            </Field>
          ))}
        </div>
      </Block>

      <Block
        title="Sizes"
        description="Add form-sm or form-lg to any control."
        code={`<input className="form-input form-sm" />
<input className="form-input" />
<input className="form-input form-lg" />
<select className="form-select form-sm">...</select>`}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="s-sm" label="Small">
            {(a) => <input {...a} className="form-input form-sm" placeholder="form-sm" />}
          </Field>
          <Field id="s-md" label="Default">
            {(a) => <input {...a} className="form-input" placeholder="form-input" />}
          </Field>
          <Field id="s-lg" label="Large">
            {(a) => <input {...a} className="form-input form-lg" placeholder="form-lg" />}
          </Field>
          <Field id="s-sel-sm" label="Select small">
            {(a) => (
              <select {...a} className="form-select form-sm">
                <option>Option one</option>
                <option>Option two</option>
              </select>
            )}
          </Field>
          <Field id="s-sel-md" label="Select default">
            {(a) => (
              <select {...a} className="form-select">
                <option>Option one</option>
                <option>Option two</option>
              </select>
            )}
          </Field>
          <Field id="s-sel-lg" label="Select large">
            {(a) => (
              <select {...a} className="form-select form-lg">
                <option>Option one</option>
                <option>Option two</option>
              </select>
            )}
          </Field>
        </div>
      </Block>

      <Block
        title="Validation and states"
        description="aria-invalid=&quot;true&quot; or is-invalid gives the error look. is-valid gives the success look."
        code={`<input className="form-input is-valid" />
<input className="form-input" aria-invalid="true" aria-describedby="e-error" />
<p id="e-error" className="form-error">Enter a valid email.</p>
<input className="form-input" disabled />`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="v-valid" label="Valid" hint="Looks good.">
            {(a) => <input {...a} className="form-input is-valid" defaultValue="ada@example.com" />}
          </Field>
          <Field id="v-invalid" label="Invalid" required error="Enter a valid email address.">
            {(a) => <input {...a} className="form-input" defaultValue="ada@" />}
          </Field>
          <Field id="v-disabled" label="Disabled">
            {(a) => <input {...a} className="form-input" defaultValue="Can't edit this" disabled />}
          </Field>
          <Field id="v-readonly" label="Read only" hint="Focusable but not editable.">
            {(a) => <input {...a} className="form-input" defaultValue="ID-48213" readOnly />}
          </Field>
        </div>
      </Block>

      <Block
        title="Textarea"
        code={`<textarea rows={4} className="form-textarea" />`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="ta-1" label="Message" hint="Resizes vertically.">
            {(a) => <textarea {...a} rows={4} className="form-textarea" placeholder="Write something..." />}
          </Field>
          <Field id="ta-2" label="Disabled">
            {(a) => <textarea {...a} rows={4} className="form-textarea" disabled defaultValue="Locked" />}
          </Field>
        </div>
      </Block>

      <Block
        title="Select and multiselect"
        description="In Chrome and Edge 135+ the open list is fully styled. Other browsers use the native list."
        code={`<select className="form-select">...</select>
<select multiple className="form-multiselect">...</select>`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="sel-1" label="Gender">
            {(a) => (
              <select {...a} className="form-select" defaultValue="">
                <option value="">Select gender</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            )}
          </Field>
          <Field id="sel-2" label="Country" required error="Please choose a country.">
            {(a) => (
              <select {...a} className="form-select" defaultValue="">
                <option value="">Select country</option>
                <option>India</option>
                <option>United States</option>
              </select>
            )}
          </Field>
          <Field id="sel-3" label="Disabled select">
            {(a) => (
              <select {...a} className="form-select" disabled>
                <option>Not available</option>
              </select>
            )}
          </Field>
          <Field id="sel-4" label="Skills" hint="Hold Ctrl or Cmd to pick several.">
            {(a) => (
              <select {...a} multiple className="form-multiselect" defaultValue={["react"]}>
                <option value="react">React</option>
                <option value="node">Node.js</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
              </select>
            )}
          </Field>
        </div>
      </Block>

      <Block title="File upload" code={`<input type="file" className="form-file" />`}>
        <Field id="file-1" label="Profile photo" hint="PNG or JPG, up to 2 MB.">
          {(a) => <input {...a} type="file" accept="image/*" className="form-file" />}
        </Field>
      </Block>

      <Block
        title="Checkboxes"
        description="Wrap the input and text in a form-check label so the whole row is clickable."
        code={`<label className="form-check">
  <input type="checkbox" className="form-checkbox" />
  <span>Accept terms</span>
</label>`}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="form-check"><input type="checkbox" className="form-checkbox" /><span>Unchecked</span></label>
            <label className="form-check"><input type="checkbox" className="form-checkbox" defaultChecked /><span>Checked</span></label>
            <label className="form-check"><input type="checkbox" className="form-checkbox is-invalid" /><span>Invalid</span></label>
            <label className="form-check"><input type="checkbox" className="form-checkbox" disabled /><span>Disabled</span></label>
            <label className="form-check"><input type="checkbox" className="form-checkbox" disabled defaultChecked /><span>Disabled checked</span></label>
          </div>
          <div>
            <p className="form-label">Indeterminate (select all)</p>
            <SelectAllDemo />
          </div>
        </div>
      </Block>

      <Block
        title="Radio buttons"
        code={`<label className="form-check">
  <input type="radio" name="plan" className="form-radio" />
  <span>Free</span>
</label>`}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset className="space-y-1">
            <legend className="form-label">Plan</legend>
            {["Free", "Pro", "Team"].map((p) => (
              <label key={p} className="form-check">
                <input type="radio" name="plan-demo" className="form-radio" defaultChecked={p === "Pro"} />
                <span>{p}</span>
              </label>
            ))}
          </fieldset>
          <fieldset className="space-y-1">
            <legend className="form-label">Disabled</legend>
            <label className="form-check"><input type="radio" name="dis" className="form-radio" disabled /><span>Option A</span></label>
            <label className="form-check"><input type="radio" name="dis" className="form-radio" disabled defaultChecked /><span>Option B</span></label>
          </fieldset>
        </div>
      </Block>

      <Block
        title="Switch"
        description="The input is visually hidden and the label draws the track and knob."
        code={`<div className="form-switch">
  <input type="checkbox" id="n" className="sr-only" />
  <label htmlFor="n"><span aria-hidden="true" /><span className="sr-only">Notifications</span></label>
</div>`}
      >
        <div className="space-y-3">
          <Switch
            id="sw-1"
            label={`Notifications are ${notify ? "on" : "off"}`}
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
          />
          <Switch id="sw-2" label="Off by default" defaultChecked={false} />
          <Switch id="sw-3" label="Disabled off" disabled />
          <Switch id="sw-4" label="Disabled on" disabled defaultChecked />
        </div>
      </Block>
    </div>
  );
}

/* =========================================================
   TAB 3: REAL FORM EXAMPLE
========================================================= */

const EMPTY = {
  firstName: "", lastName: "", gender: "", dob: "", membership: "free",
  street: "", city: "", state: "", postcode: "", country: "",
};

const REQUIRED = {
  firstName: "First name is required.",
  lastName: "Last name is required.",
  gender: "Please select a gender.",
  dob: "Date of birth is required.",
  street: "Street is required.",
  city: "City is required.",
  postcode: "Post code is required.",
  country: "Please select a country.",
};

function FormTab() {
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const bind = (k) => ({
    value: v[k],
    onChange: (e) => {
      setV((s) => ({ ...s, [k]: e.target.value }));
      setErrors((er) => ({ ...er, [k]: undefined }));
      setDone(false);
    },
  });

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    Object.entries(REQUIRED).forEach(([k, msg]) => {
      if (!String(v[k]).trim()) next[k] = msg;
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1500);
  };

  const reset = () => {
    setV(EMPTY);
    setErrors({});
    setDone(false);
  };

  return (
    <Block
      title="Putting it together"
      description="A complete form: required validation on submit, a loading button, and a neutral Cancel."
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="f-first" label="First Name" required error={errors.firstName}>
            {(a) => <input {...a} type="text" className="form-input" {...bind("firstName")} />}
          </Field>
          <Field id="f-last" label="Last Name" required error={errors.lastName}>
            {(a) => <input {...a} type="text" className="form-input" {...bind("lastName")} />}
          </Field>
          <Field id="f-gender" label="Select Gender" required error={errors.gender}>
            {(a) => (
              <select {...a} className="form-select" {...bind("gender")}>
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            )}
          </Field>
          <Field id="f-dob" label="Date of Birth" required error={errors.dob}>
            {(a) => <input {...a} type="date" className="form-input" {...bind("dob")} />}
          </Field>
        </div>

        <fieldset>
          <legend className="form-label">Membership</legend>
          <div className="flex gap-5">
            {["free", "paid"].map((m) => (
              <label key={m} className="form-check">
                <input
                  type="radio"
                  name="membership"
                  value={m}
                  className="form-radio"
                  checked={v.membership === m}
                  onChange={() => setV((s) => ({ ...s, membership: m }))}
                />
                <span>{cap(m)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3 rounded-lg bg-primary-500/10 px-4 py-3 text-sm font-medium text-primary-700 dark:text-primary-300">
          <InfoIcon /> Address
        </div>

        <Field id="f-street" label="Street" required error={errors.street}>
          {(a) => <input {...a} type="text" className="form-input" {...bind("street")} />}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="f-city" label="City" required error={errors.city}>
            {(a) => <input {...a} type="text" className="form-input" {...bind("city")} />}
          </Field>
          <Field id="f-state" label="State">
            {(a) => <input {...a} type="text" className="form-input" {...bind("state")} />}
          </Field>
          <Field id="f-post" label="Post Code" required error={errors.postcode}>
            {(a) => <input {...a} type="text" className="form-input" {...bind("postcode")} />}
          </Field>
          <Field id="f-country" label="Country" required error={errors.country}>
            {(a) => (
              <select {...a} className="form-select" {...bind("country")}>
                <option value="">Select country</option>
                <option value="in">India</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
              </select>
            )}
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
          <button type="button" className="btn btn-light" onClick={reset}>Cancel</button>
          <button type="submit" className={`btn btn-primary ${loading ? "btn-loading" : ""}`}>
            {loading ? "Submitting" : "Submit"}
          </button>
          {done && (
            <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
              Form submitted successfully.
            </p>
          )}
        </div>
      </form>
    </Block>
  );
}

/* =========================================================
   PAGE
========================================================= */

const TABS = [
  { id: "buttons", label: "Buttons" },
  { id: "fields", label: "Fields" },
  { id: "form", label: "Form example" },
];

export default function FormElementsDemo() {
  const [tab, setTab] = useState("buttons");

  return (
    <>
      <div
        id="showcase"
      >
        <div className="space-y-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="h2">UI kit</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Every button and field style, with the classes that produce it.
              </p>
            </div>
          </header>

          <div role="tablist" aria-label="Sections" className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`btn-sm ${tab === t.id ? "btn-primary" : "btn-light"}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "buttons" && <ButtonsTab />}
          {tab === "fields" && <FieldsTab />}
          {tab === "form" && <FormTab />}
        </div>
      </div>
    </>
  );
}