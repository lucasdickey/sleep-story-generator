"use client";

import { useState } from "react";
import { InlineField } from "./InlineField";
import { ValuesSelector } from "./ValuesSelector";

// Story configuration types
export interface StoryConfig {
  characterName: string;
  characterAge: number | null;
  characterGender: string;
  hasCompanion: boolean;
  companionName: string;
  companionAnimal: string;
  location: string;
  climate: string;
  region: string;
  values: string[];
}

// Default configuration
const defaultConfig: StoryConfig = {
  characterName: "",
  characterAge: null,
  characterGender: "",
  hasCompanion: true,
  companionName: "",
  companionAnimal: "",
  location: "",
  climate: "",
  region: "",
  values: [],
};

// Options for dropdowns
const genderOptions = [
  { value: "boy", label: "boy" },
  { value: "girl", label: "girl" },
  { value: "child", label: "child" },
];

const animalOptions = [
  "dog",
  "cat",
  "horse",
  "bird",
  "rabbit",
  "fox",
  "bear",
  "owl",
  "deer",
  "wolf",
  "dolphin",
  "elephant",
  "lion",
  "tiger",
  "panda",
  "koala",
  "penguin",
  "turtle",
  "butterfly",
  "dragonfly",
  "hedgehog",
  "squirrel",
  "raccoon",
  "otter",
  "seal",
];

const climateOptions = [
  { value: "sunny", label: "sunny" },
  { value: "snowy", label: "snowy" },
  { value: "rainy", label: "rainy" },
  { value: "foggy", label: "foggy" },
  { value: "windy", label: "windy" },
  { value: "tropical", label: "tropical" },
];

const regionOptions = [
  { value: "forest", label: "forest" },
  { value: "mountains", label: "mountains" },
  { value: "ocean", label: "ocean" },
  { value: "desert", label: "desert" },
  { value: "meadow", label: "meadow" },
  { value: "village", label: "village" },
  { value: "castle", label: "castle" },
  { value: "magical kingdom", label: "magical kingdom" },
];

const valueOptions = [
  "empathy",
  "resilience",
  "self-love",
  "courage",
  "kindness",
  "wisdom",
  "friendship",
  "perseverance",
  "honesty",
  "compassion",
  "bravery",
  "patience",
];

export function StoryConfigurationForm() {
  const [config, setConfig] = useState<StoryConfig>(defaultConfig);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Update a field in the configuration
  const updateConfig = (
    field: keyof StoryConfig,
    value: string | number | boolean | string[] | null
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Handle payment processing
  const handlePayment = async () => {
    setIsProcessingPayment(true);

    try {
      // Create payment session
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customization: config,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment session");
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      alert("There was an error processing your payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Generate the story preview with inline editable fields
  const renderStoryPreview = () => {
    return (
      <div className="text-lg leading-relaxed">
        <InlineField
          value={config.characterName}
          placeholder="character name"
          onUpdate={(value) => updateConfig("characterName", value)}
          isActive={activeField === "characterName"}
          onActivate={() => setActiveField("characterName")}
          onDeactivate={() => setActiveField(null)}
          type="text"
          width="180px"
        />
        {", "}
        {config.characterAge ? (
          <>
            {"an "}
            <InlineField
              value={config.characterAge.toString()}
              placeholder="age"
              onUpdate={(value) =>
                updateConfig("characterAge", parseInt(value) || null)
              }
              isActive={activeField === "characterAge"}
              onActivate={() => setActiveField("characterAge")}
              onDeactivate={() => setActiveField(null)}
              type="number"
              width="60px"
            />
            {" year-old "}
          </>
        ) : (
          <>
            {"an "}
            <InlineField
              value=""
              placeholder="age"
              onUpdate={(value) =>
                updateConfig("characterAge", parseInt(value) || null)
              }
              isActive={activeField === "characterAge"}
              onActivate={() => setActiveField("characterAge")}
              onDeactivate={() => setActiveField(null)}
              type="number"
              width="60px"
            />
            {" year-old "}
          </>
        )}
        <InlineField
          value={config.characterGender}
          placeholder="gender"
          onUpdate={(value) => updateConfig("characterGender", value)}
          isActive={activeField === "characterGender"}
          onActivate={() => setActiveField("characterGender")}
          onDeactivate={() => setActiveField(null)}
          type="select"
          options={genderOptions}
          width="100px"
        />
        {config.hasCompanion && (
          <>
            {", and a trusty companion "}
            <InlineField
              value={config.companionName}
              placeholder="animal name"
              onUpdate={(value) => updateConfig("companionName", value)}
              isActive={activeField === "companionName"}
              onActivate={() => setActiveField("companionName")}
              onDeactivate={() => setActiveField(null)}
              type="text"
              width="170px"
            />
            {" the "}
            <InlineField
              value={config.companionAnimal}
              placeholder="species"
              onUpdate={(value) => updateConfig("companionAnimal", value)}
              isActive={activeField === "companionAnimal"}
              onActivate={() => setActiveField("companionAnimal")}
              onDeactivate={() => setActiveField(null)}
              type="select"
              options={animalOptions.map((animal) => ({
                value: animal,
                label: animal,
              }))}
              width="140px"
            />
          </>
        )}
        {" travel across the "}
        <InlineField
          value={config.climate}
          placeholder="climate"
          onUpdate={(value) => updateConfig("climate", value)}
          isActive={activeField === "climate"}
          onActivate={() => setActiveField("climate")}
          onDeactivate={() => setActiveField(null)}
          type="select"
          options={climateOptions}
          width="120px"
        />
        {" of "}
        <InlineField
          value={config.region}
          placeholder="region"
          onUpdate={(value) => updateConfig("region", value)}
          isActive={activeField === "region"}
          onActivate={() => setActiveField("region")}
          onDeactivate={() => setActiveField(null)}
          type="select"
          options={regionOptions}
          width="180px"
        />
        {" on a journey where they learn the value of "}
        <InlineField
          value={config.values.join(", ")}
          placeholder="values & life lessons"
          onUpdate={() => {}} // Handled by ValuesSelector
          isActive={activeField === "values"}
          onActivate={() => setActiveField("values")}
          onDeactivate={() => setActiveField(null)}
          type="custom"
          width="280px"
        />
        {"."}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Story Preview Card */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-2xl">📖</div>
          <h2 className="text-2xl font-bold text-gray-800">
            Your Story Preview
          </h2>
        </div>

        <div className="bg-white/60 rounded-xl p-6 mb-6">
          {renderStoryPreview()}
        </div>

        {/* Values Selector */}
        {activeField === "values" && (
          <ValuesSelector
            selectedValues={config.values}
            availableValues={valueOptions}
            onUpdate={(values) => updateConfig("values", values)}
            onClose={() => setActiveField(null)}
          />
        )}

        {/* Companion Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="hasCompanion"
            checked={config.hasCompanion}
            onChange={(e) => updateConfig("hasCompanion", e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-0 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
          />
          <label
            htmlFor="hasCompanion"
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            Include a companion animal in the story
          </label>
        </div>

        {/* Story Summary */}
        <div className="bg-white/80 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Story Summary:
          </h3>
          <p className="text-gray-600">
            {config.characterName || "[character name]"},
            {config.characterAge
              ? ` an ${config.characterAge} year-old`
              : " an [age] year-old"}{" "}
            {config.characterGender || "[gender]"}
            {config.hasCompanion && (
              <>
                , and a trusty companion{" "}
                {config.companionName || "[animal name]"} the{" "}
                {config.companionAnimal || "[species]"}
              </>
            )}{" "}
            travel across the {config.climate || "[climate]"} of{" "}
            {config.region || "[region]"} on a journey where they learn the
            value of{" "}
            {config.values.length > 0 ? config.values.join(", ") : "[values]"}.
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          onClick={handlePayment}
          disabled={isProcessingPayment}
        >
          {isProcessingPayment ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Generate Custom Sleep Story Now - $1"
          )}
        </button>
        <p className="text-sm text-gray-500 mt-3">
          ⚡ Ready in approximately 3 minutes • 📱 SMS notification when
          complete
        </p>
      </div>
    </div>
  );
}
