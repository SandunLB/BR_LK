import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const countries = [
  { id: "af", name: "Afghanistan" },
  { id: "al", name: "Albania" },
  { id: "dz", name: "Algeria" },
  { id: "ad", name: "Andorra" },
  { id: "ao", name: "Angola" },
  { id: "ag", name: "Antigua and Barbuda" },
  { id: "ar", name: "Argentina" },
  { id: "am", name: "Armenia" },
  { id: "au", name: "Australia" },
  { id: "at", name: "Austria" },
  { id: "az", name: "Azerbaijan" },
  { id: "bs", name: "Bahamas" },
  { id: "bh", name: "Bahrain" },
  { id: "bd", name: "Bangladesh" },
  { id: "bb", name: "Barbados" },
  { id: "by", name: "Belarus" },
  { id: "be", name: "Belgium" },
  { id: "bz", name: "Belize" },
  { id: "bj", name: "Benin" },
  { id: "bt", name: "Bhutan" },
  { id: "bo", name: "Bolivia" },
  { id: "ba", name: "Bosnia and Herzegovina" },
  { id: "bw", name: "Botswana" },
  { id: "br", name: "Brazil" },
  { id: "bn", name: "Brunei" },
  { id: "bg", name: "Bulgaria" },
  { id: "bf", name: "Burkina Faso" },
  { id: "bi", name: "Burundi" },
  { id: "cv", name: "Cabo Verde" },
  { id: "kh", name: "Cambodia" },
  { id: "cm", name: "Cameroon" },
  { id: "ca", name: "Canada" },
  { id: "cf", name: "Central African Republic" },
  { id: "td", name: "Chad" },
  { id: "cl", name: "Chile" },
  { id: "cn", name: "China" },
  { id: "co", name: "Colombia" },
  { id: "km", name: "Comoros" },
  { id: "cg", name: "Congo" },
  { id: "cd", name: "Congo (Democratic Republic)" },
  { id: "cr", name: "Costa Rica" },
  { id: "ci", name: "Côte d'Ivoire" },
  { id: "hr", name: "Croatia" },
  { id: "cu", name: "Cuba" },
  { id: "cy", name: "Cyprus" },
  { id: "cz", name: "Czech Republic" },
  { id: "dk", name: "Denmark" },
  { id: "dj", name: "Djibouti" },
  { id: "dm", name: "Dominica" },
  { id: "do", name: "Dominican Republic" },
  { id: "ec", name: "Ecuador" },
  { id: "eg", name: "Egypt" },
  { id: "sv", name: "El Salvador" },
  { id: "gq", name: "Equatorial Guinea" },
  { id: "er", name: "Eritrea" },
  { id: "ee", name: "Estonia" },
  { id: "sz", name: "Eswatini" },
  { id: "et", name: "Ethiopia" },
  { id: "fj", name: "Fiji" },
  { id: "fi", name: "Finland" },
  { id: "fr", name: "France" },
  { id: "ga", name: "Gabon" },
  { id: "gm", name: "Gambia" },
  { id: "ge", name: "Georgia" },
  { id: "de", name: "Germany" },
  { id: "gh", name: "Ghana" },
  { id: "gr", name: "Greece" },
  { id: "gd", name: "Grenada" },
  { id: "gt", name: "Guatemala" },
  { id: "gn", name: "Guinea" },
  { id: "gw", name: "Guinea-Bissau" },
  { id: "gy", name: "Guyana" },
  { id: "ht", name: "Haiti" },
  { id: "hn", name: "Honduras" },
  { id: "hu", name: "Hungary" },
  { id: "is", name: "Iceland" },
  { id: "in", name: "India" },
  { id: "id", name: "Indonesia" },
  { id: "ir", name: "Iran" },
  { id: "iq", name: "Iraq" },
  { id: "ie", name: "Ireland" },
  { id: "il", name: "Israel" },
  { id: "it", name: "Italy" },
  { id: "jm", name: "Jamaica" },
  { id: "jp", name: "Japan" },
  { id: "jo", name: "Jordan" },
  { id: "kz", name: "Kazakhstan" },
  { id: "ke", name: "Kenya" },
  { id: "ki", name: "Kiribati" },
  { id: "kp", name: "Korea (North)" },
  { id: "kr", name: "Korea (South)" },
  { id: "kw", name: "Kuwait" },
  { id: "kg", name: "Kyrgyzstan" },
  { id: "la", name: "Laos" },
  { id: "lv", name: "Latvia" },
  { id: "lb", name: "Lebanon" },
  { id: "ls", name: "Lesotho" },
  { id: "lr", name: "Liberia" },
  { id: "ly", name: "Libya" },
  { id: "li", name: "Liechtenstein" },
  { id: "lt", name: "Lithuania" },
  { id: "lu", name: "Luxembourg" },
  { id: "mg", name: "Madagascar" },
  { id: "mw", name: "Malawi" },
  { id: "my", name: "Malaysia" },
  { id: "mv", name: "Maldives" },
  { id: "ml", name: "Mali" },
  { id: "mt", name: "Malta" },
  { id: "mh", name: "Marshall Islands" },
  { id: "mr", name: "Mauritania" },
  { id: "mu", name: "Mauritius" },
  { id: "mx", name: "Mexico" },
  { id: "fm", name: "Micronesia" },
  { id: "md", name: "Moldova" },
  { id: "mc", name: "Monaco" },
  { id: "mn", name: "Mongolia" },
  { id: "me", name: "Montenegro" },
  { id: "ma", name: "Morocco" },
  { id: "mz", name: "Mozambique" },
  { id: "mm", name: "Myanmar" },
  { id: "na", name: "Namibia" },
  { id: "nr", name: "Nauru" },
  { id: "np", name: "Nepal" },
  { id: "nl", name: "Netherlands" },
  { id: "nz", name: "New Zealand" },
  { id: "ni", name: "Nicaragua" },
  { id: "ne", name: "Niger" },
  { id: "ng", name: "Nigeria" },
  { id: "mk", name: "North Macedonia" },
  { id: "no", name: "Norway" },
  { id: "om", name: "Oman" },
  { id: "pk", name: "Pakistan" },
  { id: "pw", name: "Palau" },
  { id: "pa", name: "Panama" },
  { id: "pg", name: "Papua New Guinea" },
  { id: "py", name: "Paraguay" },
  { id: "pe", name: "Peru" },
  { id: "ph", name: "Philippines" },
  { id: "pl", name: "Poland" },
  { id: "pt", name: "Portugal" },
  { id: "qa", name: "Qatar" },
  { id: "ro", name: "Romania" },
  { id: "ru", name: "Russia" },
  { id: "rw", name: "Rwanda" },
  { id: "kn", name: "Saint Kitts and Nevis" },
  { id: "lc", name: "Saint Lucia" },
  { id: "vc", name: "Saint Vincent and the Grenadines" },
  { id: "ws", name: "Samoa" },
  { id: "sm", name: "San Marino" },
  { id: "st", name: "São Tomé and Príncipe" },
  { id: "sa", name: "Saudi Arabia" },
  { id: "sn", name: "Senegal" },
  { id: "rs", name: "Serbia" },
  { id: "sc", name: "Seychelles" },
  { id: "sl", name: "Sierra Leone" },
  { id: "sg", name: "Singapore" },
  { id: "sk", name: "Slovakia" },
  { id: "si", name: "Slovenia" },
  { id: "sb", name: "Solomon Islands" },
  { id: "so", name: "Somalia" },
  { id: "za", name: "South Africa" },
  { id: "ss", name: "South Sudan" },
  { id: "es", name: "Spain" },
  { id: "lk", name: "Sri Lanka" },
  { id: "sd", name: "Sudan" },
  { id: "sr", name: "Suriname" },
  { id: "se", name: "Sweden" },
  { id: "ch", name: "Switzerland" },
  { id: "sy", name: "Syria" },
  { id: "tj", name: "Tajikistan" },
  { id: "tz", name: "Tanzania" },
  { id: "th", name: "Thailand" },
  { id: "tl", name: "Timor-Leste" },
  { id: "tg", name: "Togo" },
  { id: "to", name: "Tonga" },
  { id: "tt", name: "Trinidad and Tobago" },
  { id: "tn", name: "Tunisia" },
  { id: "tr", name: "Turkey" },
  { id: "tm", name: "Turkmenistan" },
  { id: "tv", name: "Tuvalu" },
  { id: "ug", name: "Uganda" },
  { id: "ua", name: "Ukraine" },
  { id: "ae", name: "United Arab Emirates" },
  { id: "gb", name: "United Kingdom" },
  { id: "us", name: "United States" },
  { id: "uy", name: "Uruguay" },
  { id: "uz", name: "Uzbekistan" },
  { id: "vu", name: "Vanuatu" },
  { id: "va", name: "Vatican City" },
  { id: "ve", name: "Venezuela" },
  { id: "vn", name: "Vietnam" },
  { id: "ye", name: "Yemen" },
  { id: "zm", name: "Zambia" },
  { id: "zw", name: "Zimbabwe" },
]

interface AddressDetailsProps {
  onNext: (details: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }) => void
  onBack: () => void
  initialData?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export function AddressDetails({ onNext, onBack, initialData }: AddressDetailsProps) {
  const [street, setStreet] = useState(initialData?.street || "")
  const [city, setCity] = useState(initialData?.city || "")
  const [state, setState] = useState(initialData?.state || "")
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || "")
  const [country, setCountry] = useState(initialData?.country || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ street, city, state, postalCode, country })
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Residential Address
        </h2>
        <p className="text-gray-500 mt-2">Provide your residential address details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Street Address</label>
          <Input
            required
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Enter street address"
            className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <Input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">State/Province</label>
            <Input
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Enter state/province"
              className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Postal Code</label>
            <Input
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Enter postal code"
              className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select required value={country} onValueChange={setCountry}>
              <SelectTrigger className="border-gray-200 focus:border-indigo-600 focus:ring-indigo-600">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="px-8">
            Back
          </Button>
          <Button
            type="submit"
            disabled={!street || !city || !state || !postalCode || !country}
            className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

