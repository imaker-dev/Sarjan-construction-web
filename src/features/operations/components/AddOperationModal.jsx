import { InputField } from "@components/fields/InputField";
import { TextareaField } from "@components/fields/TextareaField";
import ModalBasic from "@components/ui/ModalBasic";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";

const INITIAL_FORM = {
  key: "",
  domain: "",
  name: "",
  description: "",
  sensitive: false,
};

// --------------------------------------------------
// Validation Schema
// --------------------------------------------------

const validationSchema = Yup.object({
  key: Yup.string()
    .trim()
    .required("Operation key is required")
    .max(100, "Operation key cannot exceed 100 characters")
    .matches(
      /^[A-Za-z0-9_-]+$/,
      "Only letters, numbers, underscores and hyphens are allowed",
    ),

  domain: Yup.string()
    .trim()
    .required("Domain is required")
    .max(80, "Domain cannot exceed 80 characters")
    .matches(
      /^[A-Za-z0-9_-]+$/,
      "Only letters, numbers, underscores and hyphens are allowed",
    ),

  name: Yup.string()
    .trim()
    .required("Operation name is required")
    .max(150, "Name cannot exceed 150 characters"),

  description: Yup.string()
    .trim()
    .required("Description is required")
    .max(500, "Description cannot exceed 500 characters"),

  sensitive: Yup.boolean(),
});

// --------------------------------------------------
// Add Operation Modal
// --------------------------------------------------

const AddOperationModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  return (
    <ModalBasic
      id="add-operation-modal"
      title="Add Operation"
      isOpen={isOpen}
      onClose={onClose}
    >
      <Formik
        initialValues={INITIAL_FORM}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          const payload = {
            key: values.key.trim().toUpperCase().replace(/\s+/g, "_"),
            domain: values.domain.trim().toUpperCase().replace(/\s+/g, "_"),
            name: values.name.trim(),
            description: values.description.trim(),
            sensitive: values.sensitive,
          };

          await onSubmit(payload, resetForm);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
        }) => (
          <Form>
            <div className="space-y-4 p-5">
              <InputField
                label="Operation Key"
                name="key"
                value={values.key}
                onChange={(event) =>
                  setFieldValue("key", event.target.value.toUpperCase())
                }
                onBlur={handleBlur}
                error={touched.key && errors.key}
                required
                placeholder="e.g. BILL_PAYMENT_APPROVE"
              />

              <InputField
                label="Domain"
                name="domain"
                value={values.domain}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.domain && errors.domain}
                required
                placeholder="e.g. BILLING"
              />

              <InputField
                label="Operation Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && errors.name}
                required
                placeholder="e.g. Approve bill payment"
              />

              <TextareaField
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && errors.description}
                required
                rows={3}
                placeholder="Describe what this operation allows..."
              />

              {/* Sensitive Operation */}
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="sensitive"
                  checked={values.sensitive}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <span>Sensitive Operation</span>
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn btn-outline"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Creating..." : "Create Operation"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalBasic>
  );
};

export default AddOperationModal;
