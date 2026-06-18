import { saveVariantAction } from "@/app/actions";
import { Button } from "./button";

export function AdminVariantForm({
  productId,
  products,
  colors,
}: {
  productId?: string;
  products?: { id: string; title: string }[];
  colors: { id: string; name: string }[];
}) {
  return (
    <form action={saveVariantAction} className="grid gap-3 border border-black bg-white p-5 transition-shadow duration-200 focus-within:shadow-[6px_6px_0_#101010]">
      <h2 className="text-xl font-black">Добавить вариант (размер/цвет)</h2>
      {productId ? (
        <input type="hidden" name="productId" value={productId} />
      ) : (
        <label className="grid gap-1 text-sm font-black uppercase">
          Товар
          <select name="productId" className="min-h-11 border border-black bg-white px-3 transition-colors duration-150 focus:border-[var(--accent)]">
            {products?.map((product) => (
              <option key={product.id} value={product.id}>{product.title}</option>
            ))}
          </select>
        </label>
      )}
      <label className="grid gap-1 text-sm font-black uppercase">
        Цвет
        <select name="colorId" className="min-h-11 border border-black bg-white px-3 transition-colors duration-150 focus:border-[var(--accent)]">
          {colors.map((color) => (
            <option key={color.id} value={color.id}>{color.name}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Размер" name="size" />
        <Field label="SKU" name="sku" />
      </div>
      <label className="flex items-center gap-2 text-sm font-black uppercase">
        <input type="checkbox" name="inStock" defaultChecked className="h-5 w-5 accent-[var(--accent)]" />
        В наличии
      </label>
      <Button variant="secondary">Сохранить вариант</Button>
    </form>
  );
}

function Field(props: React.ComponentProps<"input"> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="grid gap-1 text-sm font-black uppercase">
      {label}
      <input className="min-h-11 border border-black px-3 text-base font-normal normal-case transition-colors duration-150 focus:border-[var(--accent)]" {...inputProps} />
    </label>
  );
}
