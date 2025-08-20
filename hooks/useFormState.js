import { useState } from "react";

export function useFormState(initialState) {
  const [formState, setFormState] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const keys = name.split(".");
      setFormState((prev) => {
        const updated = { ...prev };
        let ref = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          ref[keys[i]] = { ...ref[keys[i]] };
          ref = ref[keys[i]];
        }
        ref[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => setFormState(initialState);

  return { formState, setFormState, handleChange, resetForm };
}