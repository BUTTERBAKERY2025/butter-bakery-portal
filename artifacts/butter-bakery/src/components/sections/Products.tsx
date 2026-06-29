import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import coffeeImg from "@/assets/coffee.png";
import pastryImg from "@/assets/pastry.png";
import { useState } from "react";

const coffeeMenu = {
  drip: ["V60", "Japanese Pro Drip", "Coffee Day"],
  hot: ["Espresso", "Latte", "Cappuccino", "Cortado", "Flat White", "Pistachio Latte", "Spanish Latte", "Americano"],
  cold: ["Cold Espresso", "Iced Latte", "Cold Cappuccino", "Cold Cortado", "Cold Flat White", "Iced Pistachio Latte", "Iced Spanish Latte", "Iced Americano"],
  fresh: ["Fresh Juice", "Mojito"],
};

const pastryMenu = {
  tarts: [
    "Tarte au citron meringuée — Lemon Meringue Tart",
    "Tarte pistache fleur d'oranger — Orange Blossom Pistachio Tart",
    "Tarte au chocolat — Chocolate Tart",
  ],
  cakes: [
    "Vanille framboise — Raspberry Vanilla",
    "Le noisette gianduja — Gianduja Hazelnut",
    "Fraise menthe amande — Strawberry Mint Almond",
    "Caramel vanille praliné — Caramel Vanilla Praline",
    "Chocolat croustillant praliné — Crispy Praline Chocolate",
    "Cheese-cake exotique — Exotic Cheesecake",
    "Opéra — Opera",
  ],
  verrines: [
    "Mousse au chocolat — Chocolate Mousse",
    "Panna cotta framboise — Raspberry Panna Cotta",
    "Panna cotta exotique — Exotic Panna Cotta",
  ],
  choux: ["Pâte à Choux", "Macarons"],
};

const chimneyMenu = {
  cake: ["Classic Cinnamon Cake", "Classic Red Velvet", "Pistachio Classic Cake", "Classic Coconut Cake"],
  icecream: ["Pistachio Dream Cone", "Oreo Ice Cream", "Lotus Ice Cream", "Marshmallow Cheesecake", "Red Velvet", "Bounty", "Mix Berry"],
  bites: ["Cinnamon Cake Mango Bites", "Red Velvet White Chocolate", "Gianduja Hazelnut Bites"],
};

const pizzaMenu = {
  neapolitan: ["Rucola Pizza", "Ranch Pizza", "Pizza Fokadsha Dalbana", "Argola Pesto", "Margherita", "Formag", "Caprese"],
  sourdough: ["Caprese Sourdough", "Rucola Sourdough", "Turkish Smoked Sandwich", "Salami Sandwich"],
};

const saladMenu = {
  salads: ["Apple Beet Salad", "Mango Salad", "Quinoa Salad"],
  snacks: ["Fresh Tortilla", "Bookchino"],
  bruschetta: ["Bruschetta Beetroot", "Bruschetta Cheddar Eggs", "Bruschetta Philadelphia", "Bruschetta Kerry Dry", "Spanish Egg Bruschetta", "Bruschetta Avocado"],
};

const breadMenu = [
  "Roll", "Large Loaf", "Sandwich Bread", "Baguette", "Focaccia",
  "French-Style Bread", "International Breads",
];

const categories = [
  { id: "coffee", label: "Specialty Coffee", labelAr: "القهوة المختصة" },
  { id: "pastry", label: "French Pastry", labelAr: "الباستري الفرنسي" },
  { id: "chimney", label: "Chimney Cake", labelAr: "الشمسي كيك" },
  { id: "pizza", label: "Pizza & Sourdough", labelAr: "البيتزا والعجين المخمر" },
  { id: "salads", label: "Salads & Snacks", labelAr: "السلطات والسناكس" },
  { id: "bread", label: "Traditional Bread", labelAr: "الخبز العالمي" },
];

function MenuList({ items, title }: { items: string[]; title?: string }) {
  return (
    <div className="mb-6">
      {title && <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-3">{title}</p>}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-foreground/70 font-light text-sm leading-relaxed flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-primary/50 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Products() {
  const [activeTab, setActiveTab] = useState("coffee");

  return (
    <section id="products" className="py-32 md:py-48 bg-background relative">
      <div className="container mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-20 md:mb-28">
          <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Our Craft</h2>
          <h3 className="font-serif text-4xl md:text-5xl text-foreground font-medium mb-6">Exquisite Offerings</h3>
          <p className="text-foreground/60 font-light max-w-2xl mx-auto text-lg leading-relaxed">
            Everything that falls under the name of baked goods and pastries, prepared daily fresh — all international items in French and European tradition.
          </p>
        </FadeIn>

        {/* Hero Feature: Coffee + Pastry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
          <div className="group">
            <FadeIn direction="up">
              <div className="aspect-[4/3] w-full overflow-hidden mb-8 relative">
                <img
                  src={coffeeImg}
                  alt="Specialty Coffee"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
              </div>
              <h4 className="font-serif text-3xl text-foreground mb-3">Specialty Coffee</h4>
              <p className="text-foreground/70 font-light leading-relaxed mb-4">
                We have a special coffee crop and distinctive varieties prepared and roasted in a uniquely specialized way for Butter Bakery — offering drip, hot, and cold selections across V60, Japanese Pro, Espresso, Latte, Cappuccino, Pistachio Latte, Spanish Latte, and more.
              </p>
              <div className="h-[1px] w-full bg-border" />
            </FadeIn>
          </div>

          <div className="group lg:mt-24">
            <FadeIn direction="up" delay={0.2}>
              <div className="aspect-[4/3] w-full overflow-hidden mb-8 relative">
                <img
                  src={pastryImg}
                  alt="French Pastry"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
              </div>
              <h4 className="font-serif text-3xl text-foreground mb-3">French Pastry</h4>
              <p className="text-foreground/70 font-light leading-relaxed mb-4">
                From the classic art of French pâtisserie — buttery croissants, delicate macarons, elegant tarts (lemon meringue, pistachio, chocolate), and signature individual cakes: Raspberry Vanilla, Gianduja Hazelnut, Exotic Cheesecake, and Opera. More than a pride — it is an art form.
              </p>
              <div className="h-[1px] w-full bg-border" />
            </FadeIn>
          </div>
        </div>

        {/* Full Menu Explorer */}
        <FadeIn>
          <div className="border border-border/50 rounded-sm overflow-hidden">
            <div className="bg-secondary/50 px-6 py-4 border-b border-border/50">
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50 font-medium mb-4">Browse Full Menu</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`px-4 py-2 text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 ${
                      activeTab === cat.id
                        ? "bg-primary text-background"
                        : "bg-transparent text-foreground/60 hover:text-foreground border border-border/50 hover:border-primary/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 md:p-12">
              {activeTab === "coffee" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <MenuList items={coffeeMenu.drip} title="Coffee Drip" />
                  <MenuList items={coffeeMenu.hot} title="Hot Drinks" />
                  <MenuList items={coffeeMenu.cold} title="Cold Coffee" />
                  <MenuList items={coffeeMenu.fresh} title="Fresh & Mocktail" />
                </div>
              )}
              {activeTab === "pastry" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <MenuList items={pastryMenu.tarts} title="Tartes / Tarts" />
                    <MenuList items={pastryMenu.choux} title="Pâte à Choux & Macarons" />
                  </div>
                  <div>
                    <MenuList items={pastryMenu.cakes} title="Gâteau Individuel / Individual Cakes" />
                    <MenuList items={pastryMenu.verrines} title="Verrines / Dessert Cups" />
                  </div>
                </div>
              )}
              {activeTab === "chimney" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-foreground/50 font-light text-sm mb-4 leading-relaxed">
                      The original 100-year-old recipe — revived and evolved for modern tastes. Cone-shaped baked cake with sweet and savory flavors.
                    </p>
                    <MenuList items={chimneyMenu.cake} title="Chimney Cake" />
                  </div>
                  <MenuList items={chimneyMenu.icecream} title="Ice Cream Chimney" />
                  <MenuList items={chimneyMenu.bites} title="Cake Bites" />
                </div>
              )}
              {activeTab === "pizza" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-foreground/50 font-light text-sm mb-4 leading-relaxed">
                      Neapolitan-style: thin, soft crust cooked at high temperature — charred edges, simple tomato sauce, fresh mozzarella, fresh basil.
                    </p>
                    <MenuList items={pizzaMenu.neapolitan} title="Neapolitan Pizza" />
                  </div>
                  <MenuList items={pizzaMenu.sourdough} title="Sourdough Slices" />
                </div>
              )}
              {activeTab === "salads" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <MenuList items={saladMenu.salads} title="Salads" />
                  <MenuList items={saladMenu.snacks} title="Snack Dishes" />
                  <MenuList items={saladMenu.bruschetta} title="Bruschetta Sourdough" />
                </div>
              )}
              {activeTab === "bread" && (
                <div className="max-w-md">
                  <p className="text-foreground/50 font-light text-sm mb-6 leading-relaxed">
                    Everything prepared fresh daily — international items crafted in French and European baking tradition, using part-baked and fully-baked techniques.
                  </p>
                  <MenuList items={breadMenu} title="Bread Varieties" />
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Catering CTA */}
        <FadeIn delay={0.2}>
          <div className="mt-16 p-10 md:p-14 border border-primary/20 text-center">
            <h4 className="font-serif text-2xl md:text-3xl text-foreground mb-4">Catering & Events</h4>
            <p className="text-foreground/60 font-light leading-relaxed max-w-xl mx-auto mb-6">
              Bringing the Butter Bakery experience to your most important gatherings. We work with individuals, companies, offices, restaurants, and government entities for bespoke catering and supply agreements.
            </p>
            <a
              href="mailto:info@butterbakery.co?subject=Catering Inquiry"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-primary font-medium hover:text-foreground transition-colors"
            >
              Inquire About Catering
              <span className="h-[1px] w-8 bg-current" />
            </a>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
