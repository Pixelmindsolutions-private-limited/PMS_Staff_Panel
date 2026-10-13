import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft, Info, Layers, Settings, Image as ImageIcon, Hash, Box, Truck, Tag, Plus } from "lucide-react";

const sections = [
  { id: "basic", title: "1. Basic Information", icon: Info },
  { id: "description", title: "2. Description", icon: Layers },
  { id: "specifications", title: "3. Product Specifications", icon: Settings },
  { id: "images", title: "4. Product Images", icon: ImageIcon },
  { id: "variants", title: "5. Product Variants", icon: Hash },
  { id: "inventory", title: "6. Inventory", icon: Box },
  { id: "shipping", title: "7. Shipping (Optional)", icon: Truck },
  { id: "tags", title: "9. Product Tags", icon: Tag },
  { id: "settings", title: "10. Additional Settings", icon: Settings },
];

const inputClass = "w-full rounded-xl border border-slate-700 bg-[#08112f] px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-fuchsia-500";
const labelClass = "mb-2 block text-sm font-semibold text-slate-100";

function Field({ label, placeholder, type = "text", required = false, children, ...props }) {
  return <label className="block min-w-0"><span className={labelClass}>{label}{required && " *"}</span>{children || <input className={inputClass} type={type} placeholder={placeholder} required={required} {...props} />}</label>;
}

function SelectField({ label, placeholder, options = [], required = false, ...props }) {
  return <Field label={label} required={required}><select className={`${inputClass} appearance-none`} defaultValue="" required={required} {...props}><option value="" disabled>{placeholder}</option>{options.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>;
}

const CreateProductForm = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(Object.fromEntries(sections.map((section) => [section.id, true])));
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [variantCount, setVariantCount] = useState(0);

  const addTag = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) setTags([...tags, value]);
    setTagInput("");
  };

  const toggle = (id) => setOpen((current) => ({ ...current, [id]: !current[id] }));

  return <main className="min-h-screen bg-[#050d27] px-4 py-8 text-white sm:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="rounded-xl bg-slate-800/70 p-3 hover:bg-slate-700"><ArrowLeft size={22} /></button>
        <div><h1 className="text-3xl font-bold sm:text-4xl">Create New Product</h1><p className="mt-1 text-slate-400">Add a new product to your catalog</p></div>
      </header>

      <form onSubmit={(event) => event.preventDefault()} className="space-y-5">
        {sections.map(({ id, title, icon: Icon }) => <section key={id} className="rounded-3xl border border-slate-800 bg-[#07102e] p-5 sm:p-8">
          <button type="button" onClick={() => toggle(id)} className="flex w-full items-center justify-between border-b border-slate-800 pb-4 text-left">
            <span className="flex items-center gap-3 text-xl font-bold"><Icon size={23} className="text-fuchsia-500" />{title}</span><ChevronDown size={23} className={`text-slate-400 transition-transform ${open[id] ? "rotate-0" : "-rotate-90"}`} />
          </button>

          {open[id] && <div className="pt-6">
            {id === "basic" && <div className="grid gap-6 md:grid-cols-2">
              <Field label="Product Name" placeholder="Enter product name" required />
              <SelectField label="Category" placeholder="Select Category" options={["Clothing", "Accessories", "Footwear", "Home & Living"]} required />
              <SelectField label="Subcategory" placeholder="Select Subcategory" options={["Shirts", "Trousers", "Dresses", "Bags", "Shoes"]} />
              <Field label="Brand" placeholder="Brand Name" />
              <SelectField label="Gender" placeholder="Select Gender" options={["Men", "Women", "Unisex", "Kids"]} />
              <label className="flex items-center gap-3 self-end pb-3"><input type="checkbox" defaultChecked className="h-5 w-5 accent-fuchsia-500" /> Product Status (Active)</label>
            </div>}

            {id === "description" && <div className="space-y-6"><Field label="Short Description" placeholder="Brief summary" /><Field label="Detailed Description"><textarea className={`${inputClass} min-h-44 resize-y`} placeholder="Full product details" /></Field></div>}

            {id === "specifications" && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{["Fabric", "Color", "Pattern", "Fit", "Sleeve", "Neck", "Occasion", "Wash Care", "Length"].map((name) => <Field key={name} label={name} />)}</div>}

            {id === "images" && <div className="grid gap-6 md:grid-cols-2">{["Main Image", "Main Video (Optional)", "Additional Images"].map((label) => <Field key={label} label={label} required={label === "Main Image"}><input className={`${inputClass} file:mr-4 file:rounded-lg file:border-0 file:bg-fuchsia-600 file:px-4 file:py-2 file:font-semibold file:text-white`} type="file" accept={label.includes("Video") ? "video/*" : "image/*"} multiple={label === "Additional Images"} required={label === "Main Image"} /></Field>)}</div>}

            {id === "variants" && <div className="rounded-2xl bg-[#111b3b] p-5"><div className="mb-5 flex items-center justify-between"><h3 className="font-semibold">Add New Variant</h3><span className="text-sm text-slate-400">{variantCount} added</span></div><div className="grid gap-4 md:grid-cols-3"><Field label="Color" placeholder="Color *" /><Field label="Price" placeholder="Price *" type="number" /><Field label="Discount Price" placeholder="Discount Price" type="number" /></div><p className="mb-3 mt-6 text-sm text-slate-400">Sizes, SKU, MRP, Selling Price, Stock</p><div className="flex flex-wrap gap-3"><input className={`${inputClass} w-36`} placeholder="Size (S, M, L)" /><input className={`${inputClass} w-36`} placeholder="SKU" /><input className={`${inputClass} w-32`} placeholder="MRP" type="number" /><input className={`${inputClass} w-36`} placeholder="Selling Price" type="number" /><input className={`${inputClass} w-28`} placeholder="Stock" type="number" /><button type="button" onClick={() => setVariantCount(variantCount + 1)} className="rounded-xl bg-emerald-500/20 px-4 py-3 font-semibold text-emerald-300">Add Size</button></div><div className="mt-6"><Field label="Variant Images"><input className={`${inputClass} file:mr-4 file:rounded-lg file:border-0 file:bg-fuchsia-600 file:px-4 file:py-2 file:font-semibold file:text-white`} type="file" accept="image/*" multiple /></Field></div><button type="button" onClick={() => setVariantCount(variantCount + 1)} className="mt-5 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-600 py-3 font-bold">Add Variant</button></div>}

            {id === "inventory" && <div className="max-w-md"><Field label="Total Stock" type="number" placeholder="0" /></div>}
            {id === "shipping" && <div className="grid gap-6 md:grid-cols-2"><Field label="Weight" placeholder="Weight" type="number" /><Field label="Dimensions" placeholder="Length × Width × Height" /></div>}
            {id === "tags" && <><div className="flex gap-3"><input className={inputClass} placeholder="Enter tags..." value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addTag())} /><button type="button" onClick={addTag} className="rounded-xl bg-fuchsia-600/30 px-5 text-fuchsia-300"><Plus /></button></div>{tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-sm">{tag}</span>)}</div>}</>}
            {id === "settings" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["New Arrival", "Featured", "Returnable", "Best Seller", "Exchange Available"].map((option) => <label key={option} className="flex items-center gap-3"><input type="checkbox" defaultChecked={option === "Returnable"} className="h-5 w-5 accent-fuchsia-500" />{option}</label>)}</div>}
          </div>}
        </section>)}
        <div className="flex justify-end gap-3 pb-8"><button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200">Cancel</button><button type="submit" className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-600 px-8 py-3 font-semibold">Create Product</button></div>
      </form>
    </div>
  </main>;
};

export default CreateProductForm;
