
-- foods (shared, read-only for users)
CREATE TABLE public.foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  category text NOT NULL,
  serving_size numeric NOT NULL DEFAULT 100,
  serving_unit text NOT NULL DEFAULT 'g',
  calories numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  fiber numeric NOT NULL DEFAULT 0,
  sugar numeric,
  sodium numeric,
  barcode text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.foods TO authenticated;
GRANT ALL ON public.foods TO service_role;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foods readable by all authenticated" ON public.foods FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_foods_name ON public.foods USING gin (to_tsvector('simple', name || ' ' || coalesce(brand,'') || ' ' || category));
CREATE INDEX idx_foods_barcode ON public.foods(barcode);

-- user_foods (private custom foods)
CREATE TABLE public.user_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  category text DEFAULT 'Custom',
  serving_size numeric NOT NULL DEFAULT 100,
  serving_unit text NOT NULL DEFAULT 'g',
  calories numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  fiber numeric NOT NULL DEFAULT 0,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_foods TO authenticated;
GRANT ALL ON public.user_foods TO service_role;
ALTER TABLE public.user_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own custom foods" ON public.user_foods FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- diary_entries
CREATE TABLE public.diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snacks','pre_workout','post_workout')),
  food_id uuid REFERENCES public.foods(id) ON DELETE SET NULL,
  user_food_id uuid REFERENCES public.user_foods(id) ON DELETE SET NULL,
  food_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  serving_size numeric NOT NULL DEFAULT 100,
  serving_unit text NOT NULL DEFAULT 'g',
  calories numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  fiber numeric NOT NULL DEFAULT 0,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diary_entries TO authenticated;
GRANT ALL ON public.diary_entries TO service_role;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own diary" ON public.diary_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_diary_user_date ON public.diary_entries(user_id, entry_date);

-- nutrition_goals
CREATE TABLE public.nutrition_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL DEFAULT 'auto',
  calorie_goal numeric NOT NULL DEFAULT 2000,
  protein_goal numeric NOT NULL DEFAULT 150,
  carb_goal numeric NOT NULL DEFAULT 250,
  fat_goal numeric NOT NULL DEFAULT 65,
  fiber_goal numeric NOT NULL DEFAULT 30,
  is_custom boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_goals TO authenticated;
GRANT ALL ON public.nutrition_goals TO service_role;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own goals" ON public.nutrition_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_nutrition_goals_updated BEFORE UPDATE ON public.nutrition_goals FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed foods (per 100g / standard serving)
INSERT INTO public.foods (name, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, sodium) VALUES
-- Fruits
('Apple','Fruit',100,'g',52,0.3,14,0.2,2.4,10,1),
('Banana','Fruit',100,'g',89,1.1,23,0.3,2.6,12,1),
('Orange','Fruit',100,'g',47,0.9,12,0.1,2.4,9,0),
('Strawberries','Fruit',100,'g',32,0.7,7.7,0.3,2,4.9,1),
('Blueberries','Fruit',100,'g',57,0.7,14,0.3,2.4,10,1),
('Grapes','Fruit',100,'g',69,0.7,18,0.2,0.9,16,2),
('Mango','Fruit',100,'g',60,0.8,15,0.4,1.6,14,1),
('Pineapple','Fruit',100,'g',50,0.5,13,0.1,1.4,10,1),
('Watermelon','Fruit',100,'g',30,0.6,8,0.2,0.4,6,1),
('Avocado','Fruit',100,'g',160,2,9,15,7,0.7,7),
('Pomegranate','Fruit',100,'g',83,1.7,19,1.2,4,14,3),
('Kiwi','Fruit',100,'g',61,1.1,15,0.5,3,9,3),
-- Vegetables
('Broccoli','Vegetable',100,'g',34,2.8,7,0.4,2.6,1.7,33),
('Spinach','Vegetable',100,'g',23,2.9,3.6,0.4,2.2,0.4,79),
('Carrot','Vegetable',100,'g',41,0.9,10,0.2,2.8,4.7,69),
('Tomato','Vegetable',100,'g',18,0.9,3.9,0.2,1.2,2.6,5),
('Cucumber','Vegetable',100,'g',15,0.7,3.6,0.1,0.5,1.7,2),
('Bell Pepper','Vegetable',100,'g',31,1,6,0.3,2.1,4.2,4),
('Onion','Vegetable',100,'g',40,1.1,9.3,0.1,1.7,4.2,4),
('Potato','Vegetable',100,'g',77,2,17,0.1,2.2,0.8,6),
('Sweet Potato','Vegetable',100,'g',86,1.6,20,0.1,3,4.2,55),
('Cauliflower','Vegetable',100,'g',25,1.9,5,0.3,2,1.9,30),
('Kale','Vegetable',100,'g',49,4.3,9,0.9,3.6,2.3,38),
('Cabbage','Vegetable',100,'g',25,1.3,5.8,0.1,2.5,3.2,18),
('Green Beans','Vegetable',100,'g',31,1.8,7,0.2,2.7,3.3,6),
-- Grains
('White Rice (cooked)','Grain',100,'g',130,2.7,28,0.3,0.4,0.1,1),
('Brown Rice (cooked)','Grain',100,'g',112,2.6,24,0.9,1.8,0.4,5),
('Oats (dry)','Grain',100,'g',389,17,66,7,10,0,2),
('Quinoa (cooked)','Grain',100,'g',120,4.4,21,1.9,2.8,0.9,7),
('Whole Wheat Bread','Grain',40,'g',98,3.6,17,1.6,2.4,2,146),
('White Bread','Grain',40,'g',106,3.6,20,1.4,0.8,2,143),
('Pasta (cooked)','Grain',100,'g',131,5,25,1.1,1.8,0.6,1),
('Bagel','Grain',100,'g',257,10,50,1.6,2.1,6,439),
('Tortilla (flour)','Grain',50,'g',159,4,26,3.6,1.6,0.6,391),
('Cornflakes','Grain',30,'g',114,2,26,0.2,1,3.5,222),
-- Dairy
('Milk (whole)','Dairy',240,'ml',149,7.7,12,8,0,12,105),
('Milk (skim)','Dairy',240,'ml',83,8.3,12,0.2,0,12,103),
('Greek Yogurt (plain)','Dairy',100,'g',59,10,3.6,0.4,0,3.2,36),
('Yogurt (plain)','Dairy',100,'g',61,3.5,4.7,3.3,0,4.7,46),
('Cottage Cheese','Dairy',100,'g',98,11,3.4,4.3,0,2.7,364),
('Cheddar Cheese','Dairy',30,'g',121,7,0.4,10,0,0.1,180),
('Mozzarella','Dairy',30,'g',85,6,0.6,6.3,0,0.3,178),
('Butter','Dairy',10,'g',72,0.1,0,8.1,0,0,58),
('Paneer','Dairy',100,'g',265,18,1.2,21,0,1.2,22),
-- Meat
('Chicken Breast','Meat',100,'g',165,31,0,3.6,0,0,74),
('Chicken Thigh','Meat',100,'g',209,26,0,11,0,0,84),
('Ground Beef (85%)','Meat',100,'g',215,26,0,12,0,0,66),
('Beef Steak (sirloin)','Meat',100,'g',206,29,0,9,0,0,55),
('Pork Chop','Meat',100,'g',231,26,0,14,0,0,62),
('Bacon','Meat',30,'g',162,12,0.4,12,0,0,613),
('Turkey Breast','Meat',100,'g',135,30,0,1,0,0,68),
('Ham','Meat',100,'g',145,21,1.5,6,0,1,1203),
('Lamb (cooked)','Meat',100,'g',294,25,0,21,0,0,72),
-- Seafood
('Salmon','Seafood',100,'g',208,20,0,13,0,0,59),
('Tuna (canned in water)','Seafood',100,'g',116,26,0,1,0,0,247),
('Shrimp','Seafood',100,'g',99,24,0.2,0.3,0,0,111),
('Cod','Seafood',100,'g',82,18,0,0.7,0,0,54),
('Tilapia','Seafood',100,'g',96,20,0,1.7,0,0,52),
('Sardines','Seafood',100,'g',208,25,0,11,0,0,307),
-- Vegetarian proteins
('Tofu (firm)','Vegetarian Protein',100,'g',144,17,3,9,2,0.6,14),
('Tempeh','Vegetarian Protein',100,'g',192,20,8,11,0,0,9),
('Chickpeas (cooked)','Vegetarian Protein',100,'g',164,8.9,27,2.6,7.6,4.8,7),
('Lentils (cooked)','Vegetarian Protein',100,'g',116,9,20,0.4,7.9,1.8,2),
('Black Beans (cooked)','Vegetarian Protein',100,'g',132,8.9,24,0.5,8.7,0.3,1),
('Kidney Beans (cooked)','Vegetarian Protein',100,'g',127,8.7,23,0.5,6.4,0.3,1),
('Edamame','Vegetarian Protein',100,'g',122,11,10,5,5,2.2,6),
('Peanut Butter','Vegetarian Protein',32,'g',188,7,7,16,2,3,152),
-- Beverages
('Coffee (black)','Beverage',240,'ml',2,0.3,0,0,0,0,5),
('Tea (black)','Beverage',240,'ml',2,0,0.7,0,0,0,7),
('Orange Juice','Beverage',240,'ml',112,1.7,26,0.5,0.5,21,2),
('Apple Juice','Beverage',240,'ml',114,0.2,28,0.3,0.5,24,10),
('Coca Cola','Beverage',330,'ml',139,0,35,0,0,35,14),
('Diet Coke','Beverage',330,'ml',1,0,0,0,0,0,28),
('Beer','Beverage',355,'ml',153,1.6,13,0,0,0,14),
('Red Wine','Beverage',150,'ml',125,0.1,4,0,0,1,6),
('Water','Beverage',240,'ml',0,0,0,0,0,0,0),
('Almond Milk (unsweetened)','Beverage',240,'ml',30,1,1,2.5,0.5,0,180),
-- Snacks
('Potato Chips','Snack',30,'g',152,2,15,10,1.4,0.3,170),
('Popcorn (air-popped)','Snack',30,'g',115,3.7,23,1.4,4.3,0.2,2),
('Dark Chocolate 70%','Snack',30,'g',170,2,13,12,3,7,7),
('Milk Chocolate','Snack',30,'g',158,2.3,17,9,1,17,24),
('Granola Bar','Snack',40,'g',188,3,26,8,2,12,80),
('Pretzels','Snack',30,'g',114,3,24,0.8,1,0.6,388),
('Rice Cake','Snack',9,'g',35,0.7,7.3,0.3,0.4,0.1,29),
-- Nuts & Seeds
('Almonds','Nut',28,'g',164,6,6,14,3.5,1.2,0),
('Walnuts','Nut',28,'g',185,4.3,3.9,18,1.9,0.7,1),
('Cashews','Nut',28,'g',157,5,9,12,0.9,1.7,3),
('Peanuts','Nut',28,'g',161,7,6,14,2.4,1.1,5),
('Pistachios','Nut',28,'g',159,6,8,13,3,2.2,1),
('Chia Seeds','Seed',28,'g',138,4.7,12,8.7,10,0,5),
('Flax Seeds','Seed',28,'g',151,5.2,8,12,7.7,0.4,8),
('Sunflower Seeds','Seed',28,'g',165,5.5,6,14,3,0.7,2),
('Pumpkin Seeds','Seed',28,'g',151,7,5,13,1.7,0.4,2),
-- Oils
('Olive Oil','Oil',14,'g',119,0,0,14,0,0,0),
('Coconut Oil','Oil',14,'g',117,0,0,14,0,0,0),
('Butter (unsalted)','Oil',14,'g',102,0.1,0,12,0,0,2),
-- Eggs
('Egg (whole, large)','Egg',50,'g',72,6.3,0.4,5,0,0.2,71),
('Egg White','Egg',33,'g',17,3.6,0.2,0.1,0,0.2,55),
-- Fast food
('Big Mac','Fast Food',215,'g',563,26,45,33,3,9,1010),
('McDonald''s Fries (medium)','Fast Food',117,'g',365,4,48,17,4,0.2,246),
('Cheese Pizza (slice)','Fast Food',107,'g',285,12,36,10,2.5,3.8,640),
('Pepperoni Pizza (slice)','Fast Food',111,'g',313,13,36,13,2,3.9,760),
('Chicken Nuggets (6 pc)','Fast Food',96,'g',270,15,16,17,1,0.4,540),
('Cheeseburger','Fast Food',113,'g',303,15,32,13,2,7,750),
('Subway Turkey (6 inch)','Fast Food',219,'g',280,18,46,3.5,5,7,760),
-- Indian
('Roti / Chapati','Indian',40,'g',120,3,18,3.7,2,0.4,190),
('Naan','Indian',90,'g',262,9,45,5,2,3,296),
('Dal (cooked)','Indian',100,'g',116,9,20,0.4,8,1.8,238),
('Chicken Biryani','Indian',100,'g',200,7,26,7,1,1,300),
('Butter Chicken','Indian',100,'g',245,15,7,17,1,4,470),
('Palak Paneer','Indian',100,'g',180,7,7,14,2,2,410),
('Chana Masala','Indian',100,'g',150,7,22,4,6,4,380),
('Samosa','Indian',60,'g',175,3.5,22,8,2,1,220),
('Idli','Indian',60,'g',60,2,12,0.2,0.6,0.2,200),
('Dosa (plain)','Indian',80,'g',133,3,22,4,1,0.6,300),
('Poha','Indian',100,'g',180,3,32,4,1.5,1,400),
('Upma','Indian',100,'g',150,4,25,4,2,1,350),
('Aloo Paratha','Indian',120,'g',260,6,36,10,3,1,420),
('Rajma (cooked)','Indian',100,'g',140,8,22,1,7,2,320),
('Masala Dosa','Indian',150,'g',250,5,40,8,2,1,450),
('Gulab Jamun','Indian',40,'g',150,2,20,7,0.5,15,60),
-- Supplements
('Whey Protein (scoop)','Supplement',30,'g',120,24,3,1.5,0,2,50),
('Casein Protein (scoop)','Supplement',33,'g',120,24,4,1,0,1,180),
('Creatine Monohydrate','Supplement',5,'g',0,0,0,0,0,0,0),
('BCAA','Supplement',7,'g',0,0,0,0,0,0,0);
