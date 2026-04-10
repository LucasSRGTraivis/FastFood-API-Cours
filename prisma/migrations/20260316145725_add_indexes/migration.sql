-- DropIndex
DROP INDEX "restaurants_rating_idx";

-- CreateIndex
CREATE INDEX "menu_items_price_idx" ON "menu_items"("price");

-- CreateIndex
CREATE INDEX "restaurants_rating_idx" ON "restaurants"("rating" DESC);

-- CreateIndex
CREATE INDEX "restaurants_name_idx" ON "restaurants"("name");
