import React, { useState, useMemo } from "react";
import {
  Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Button, Switch, FormControlLabel, Grid
} from "@mui/material";

// Dummy API call to load template

const DUMMY_TEMPLATE = {
    id: 1,
    name: "Comprehensive Fitness Assessment",
    attributes: [
        { name: "Date of Assessment", type: "date", required: true },
        { name: "Assessment Time", type: "time", required: true },
        { name: "Height", type: "number", required: true, units: ["cm", "ft/in"], defaultUnit: "cm" },
        { name: "Weight", type: "number", required: true, units: ["kg", "lb"], defaultUnit: "kg" },
        { name: "Fat Weight", type: "number", required: false, units: ["kg", "lb"], defaultUnit: "kg" },
        { name: "Is Smoker", type: "boolean", required: true },
        { name: "Cycling Distance", type: "number", required: false, units: ["km/10min", "mi/10min"], defaultUnit: "km/10min" },
        { name: "Rowing Calories", type: "number", required: false, units: ["cal/5min"], defaultUnit: "cal/5min" },
        { name: "Squats", type: "number", required: false, units: ["count/1min"], defaultUnit: "count/1min" },
        { name: "Flexibility", type: "select", options: ["Low", "Moderate", "High"], required: true },
        { name: "BMI", type: "computed", formula: "weightKg / ((heightCm / 100) ** 2)", dependsOn: ["Height", "Weight"], units: ["kg/m2"], defaultUnit: "kg/m2" },
        { name: "Body Type", type: "computed", formula: "bodyTypeFromFatPercent(weightKg, fatWeightKg)", dependsOn: ["Weight", "Fat Weight"], units: [""], defaultUnit: "" }
    ]
};

function convertHeight(value, from, to) {
    if (from === to) return value;
    if (from === "cm" && to === "ft/in") {
        const totalInches = value / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return { feet, inches };
    }
    if (from === "ft/in" && to === "cm") {
        return value.feet * 30.48 + value.inches * 2.54;
    }
    return value;
}

function convertWeight(value, from, to) {
    if (from === to) return value;
    if (from === "kg" && to === "lb") return (value * 2.20462).toFixed(1);
    if (from === "lb" && to === "kg") return (value / 2.20462).toFixed(1);
    return value;
}

function computeBMI(height, heightUnit, weight, weightUnit) {
    const hCm = heightUnit === "cm" ? parseFloat(height) : convertHeight(height, "ft/in", "cm");
    const wKg = weightUnit === "kg" ? parseFloat(weight) : convertWeight(weight, "lb", "kg");
    if (!hCm || !wKg) return "";
    return (wKg / ((hCm / 100) ** 2)).toFixed(1);
}

function bodyTypeFromFatPercent(weight, fatWeight, weightUnit, fatWeightUnit) {
    const wKg = weightUnit === "kg" ? parseFloat(weight) : convertWeight(weight, "lb", "kg");
    const fKg = fatWeightUnit === "kg" ? parseFloat(fatWeight) : convertWeight(fatWeight, "lb", "kg");
    if (!wKg || !fKg) return "";
    const fatPercent = (fKg / wKg) * 100;
    if (fatPercent > 25) return "Obese";
    if (fatPercent > 15) return "Fit";
    return "Muscular";
}

function useAssessmentTemplate() {
  const [template, setTemplate] = useState(null);
  React.useEffect(() => {
    // Simulate API fetch
    setTimeout(() => setTemplate(DUMMY_TEMPLATE), 300);
  }, []);
  return template;
}

export default function AssessmentEntry() {
  const template = useAssessmentTemplate();
  const [form, setForm] = useState({});
  const [units, setUnits] = useState({});
  const [errors, setErrors] = useState({});

  // Utility functions for conversions and computed fields (see above)
  // ... (insert utility functions here)

  // Computed field values
  const bmi = useMemo(() => {
    if (!form.Height || !form.Weight) return "";
    const heightVal = units.Height === "ft/in" ? form.Height : parseFloat(form.Height);
    const weightVal = units.Weight === "lb" ? form.Weight : parseFloat(form.Weight);
    return computeBMI(form.Height, units.Height, form.Weight, units.Weight);
  }, [form.Height, units.Height, form.Weight, units.Weight]);

  const bodyType = useMemo(() => {
    if (!form.Weight || !form["Fat Weight"]) return "";
    return bodyTypeFromFatPercent(form.Weight, form["Fat Weight"], units.Weight, units["Fat Weight"]);
  }, [form.Weight, form["Fat Weight"], units.Weight, units["Fat Weight"]]);

  function handleFieldChange(attr, value) {
    setForm(f => ({ ...f, [attr]: value }));
    setErrors(e => ({ ...e, [attr]: undefined }));
  }

  function handleUnitChange(attr, newUnit) {
    setUnits(u => ({ ...u, [attr]: newUnit }));
  }

  function validate() {
    const errs = {};
    template.attributes.forEach(attr => {
      if (attr.type !== "computed" && attr.required && !form[attr.name]) {
        errs[attr.name] = "Required";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    // Collect all field values, including computed
    const result = {};
    template.attributes.forEach(attr => {
      if (attr.type === "computed") {
        if (attr.name === "BMI") result["BMI"] = bmi;
        if (attr.name === "Body Type") result["Body Type"] = bodyType;
      } else {
        result[attr.name] = { value: form[attr.name], unit: units[attr.name] || attr.defaultUnit };
      }
    });
    alert("Assessment submitted:\n" + JSON.stringify(result, null, 2));
    // Replace above with API call in real app
  }

  if (!template) return <Typography>Loading template...</Typography>;

  return (
    <Box maxWidth={600} mx="auto" p={3} borderRadius={3} boxShadow={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        {template.name}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {template.attributes.map(attr => {
            if (attr.type === "computed") {
              return (
                <Grid item xs={12} key={attr.name}>
                  <Typography>
                    <b>{attr.name}:</b> {attr.name === "BMI" ? bmi : (attr.name === "Body Type" ? bodyType : "")} {attr.units && attr.units[0]}
                  </Typography>
                </Grid>
              );
            }
            if (attr.type === "boolean") {
              return (
                <Grid item xs={12} key={attr.name}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!form[attr.name]}
                        onChange={e => handleFieldChange(attr.name, e.target.checked)}
                      />
                    }
                    label={attr.name}
                  />
                </Grid>
              );
            }
            if (attr.type === "select") {
              return (
                <Grid item xs={12} sm={6} key={attr.name}>
                  <FormControl fullWidth required={attr.required} error={!!errors[attr.name]}>
                    <InputLabel>{attr.name}</InputLabel>
                    <Select
                      value={form[attr.name] || ""}
                      onChange={e => handleFieldChange(attr.name, e.target.value)}
                      label={attr.name}
                    >
                      {attr.options.map(opt => (
                        <MenuItem value={opt} key={opt}>{opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              );
            }
            // For number/text with unit
            return (
              <Grid item xs={12} sm={6} key={attr.name}>
                <Box display="flex" alignItems="center">
                  <TextField
                    label={attr.name}
                    value={form[attr.name] || ""}
                    onChange={e => handleFieldChange(attr.name, e.target.value)}
                    type={attr.type}
                    required={attr.required}
                    error={!!errors[attr.name]}
                    helperText={errors[attr.name]}
                    fullWidth
                    sx={{ mr: attr.units ? 1 : 0 }}
                  />
                  {attr.units && attr.units.length > 1 ? (
                    <Select
                      value={units[attr.name] || attr.defaultUnit}
                      onChange={e => handleUnitChange(attr.name, e.target.value)}
                      size="small"
                      sx={{ width: 90 }}
                    >
                      {attr.units.map(u => (
                        <MenuItem value={u} key={u}>{u}</MenuItem>
                      ))}
                    </Select>
                  ) : attr.units ? (
                    <Typography ml={1}>{attr.units[0]}</Typography>
                  ) : null}
                </Box>
              </Grid>
            );
          })}
        </Grid>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Submit Assessment
        </Button>
      </form>
    </Box>
  );
}

// DUMMY_TEMPLATE must be included as shown above
