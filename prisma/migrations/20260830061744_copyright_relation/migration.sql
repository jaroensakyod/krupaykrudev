-- AddForeignKey
ALTER TABLE "copyright_declarations" ADD CONSTRAINT "copyright_declarations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
