import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_productos_variantes_talla" AS ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', '2', '4', '6', '8', '10', '12', '14', '16', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'Única');
  CREATE TYPE "public"."enum_productos_calce" AS ENUM('normal', 'pequena', 'grande');
  CREATE TYPE "public"."enum_productos_genero" AS ENUM('Dama', 'Caballero', 'Niño', 'Niña', 'Unisex');
  CREATE TYPE "public"."enum_productos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__productos_v_version_variantes_talla" AS ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', '2', '4', '6', '8', '10', '12', '14', '16', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'Única');
  CREATE TYPE "public"."enum__productos_v_version_calce" AS ENUM('normal', 'pequena', 'grande');
  CREATE TYPE "public"."enum__productos_v_version_genero" AS ENUM('Dama', 'Caballero', 'Niño', 'Niña', 'Unisex');
  CREATE TYPE "public"."enum__productos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_media_tipo" AS ENUM('foto', 'frame360');
  CREATE TYPE "public"."enum_pedidos_estado" AS ENUM('pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado');
  CREATE TYPE "public"."enum_users_rol" AS ENUM('admin', 'catalogo', 'ventas', 'lectura');
  CREATE TABLE "productos_variantes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color" varchar,
  	"color_hex" varchar,
  	"talla" "enum_productos_variantes_talla",
  	"sku" varchar,
  	"stock" numeric DEFAULT 0
  );
  
  CREATE TABLE "productos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"categoria_id" integer,
  	"marca" varchar,
  	"calce" "enum_productos_calce" DEFAULT 'normal',
  	"precio" numeric,
  	"precio_oferta" numeric,
  	"genero" "enum_productos_genero",
  	"descripcion" jsonb,
  	"composicion" varchar,
  	"cuidados" varchar,
  	"slug" varchar,
  	"stock_total" numeric,
  	"destacado" boolean,
  	"nuevo" boolean DEFAULT true,
  	"vendidos" numeric DEFAULT 0,
  	"actualizado_por_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_productos_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "productos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_productos_v_version_variantes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"color" varchar,
  	"color_hex" varchar,
  	"talla" "enum__productos_v_version_variantes_talla",
  	"sku" varchar,
  	"stock" numeric DEFAULT 0,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_productos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nombre" varchar,
  	"version_categoria_id" integer,
  	"version_marca" varchar,
  	"version_calce" "enum__productos_v_version_calce" DEFAULT 'normal',
  	"version_precio" numeric,
  	"version_precio_oferta" numeric,
  	"version_genero" "enum__productos_v_version_genero",
  	"version_descripcion" jsonb,
  	"version_composicion" varchar,
  	"version_cuidados" varchar,
  	"version_slug" varchar,
  	"version_stock_total" numeric,
  	"version_destacado" boolean,
  	"version_nuevo" boolean DEFAULT true,
  	"version_vendidos" numeric DEFAULT 0,
  	"version_actualizado_por_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__productos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_productos_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar,
  	"padre_id" integer,
  	"imagen_id" integer,
  	"fondo_banda_id" integer,
  	"orden" numeric DEFAULT 0,
  	"visible" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"transparente" boolean DEFAULT false,
  	"tipo" "enum_media_tipo" DEFAULT 'foto',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_miniatura_url" varchar,
  	"sizes_miniatura_width" numeric,
  	"sizes_miniatura_height" numeric,
  	"sizes_miniatura_mime_type" varchar,
  	"sizes_miniatura_filesize" numeric,
  	"sizes_miniatura_filename" varchar,
  	"sizes_tarjeta_url" varchar,
  	"sizes_tarjeta_width" numeric,
  	"sizes_tarjeta_height" numeric,
  	"sizes_tarjeta_mime_type" varchar,
  	"sizes_tarjeta_filesize" numeric,
  	"sizes_tarjeta_filename" varchar,
  	"sizes_poster_url" varchar,
  	"sizes_poster_width" numeric,
  	"sizes_poster_height" numeric,
  	"sizes_poster_mime_type" varchar,
  	"sizes_poster_filesize" numeric,
  	"sizes_poster_filename" varchar
  );
  
  CREATE TABLE "resenas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"producto_id" integer NOT NULL,
  	"nombre" varchar NOT NULL,
  	"ciudad" varchar,
  	"estrellas" numeric NOT NULL,
  	"texto" varchar NOT NULL,
  	"foto_id" integer,
  	"aprobada" boolean DEFAULT false,
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pedidos_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"producto_id" integer NOT NULL,
  	"sku" varchar NOT NULL,
  	"cantidad" numeric DEFAULT 1 NOT NULL,
  	"precio_unitario" numeric NOT NULL
  );
  
  CREATE TABLE "pedidos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"numero" varchar,
  	"estado" "enum_pedidos_estado" DEFAULT 'pendiente' NOT NULL,
  	"guia" varchar,
  	"cliente_nombre" varchar NOT NULL,
  	"cliente_email" varchar NOT NULL,
  	"cliente_telefono" varchar,
  	"direccion" varchar,
  	"total" numeric,
  	"notas" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "suscriptores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"rol" "enum_users_rol" DEFAULT 'catalogo' NOT NULL,
  	"activo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "registro" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"accion" varchar NOT NULL,
  	"coleccion" varchar NOT NULL,
  	"documento_id" varchar,
  	"titulo" varchar,
  	"usuario_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"productos_id" integer,
  	"categorias_id" integer,
  	"media_id" integer,
  	"resenas_id" integer,
  	"pedidos_id" integer,
  	"suscriptores_id" integer,
  	"users_id" integer,
  	"registro_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ajustes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"modo_catalogo" boolean DEFAULT true,
  	"whatsapp" varchar DEFAULT '+58 412 000 0000',
  	"mensaje_catalogo" varchar DEFAULT 'Muy pronto podrás comprar en línea. Mientras tanto, escríbenos por WhatsApp y te atendemos.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "productos_variantes" ADD CONSTRAINT "productos_variantes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "productos" ADD CONSTRAINT "productos_actualizado_por_id_users_id_fk" FOREIGN KEY ("actualizado_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "productos_rels" ADD CONSTRAINT "productos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_rels" ADD CONSTRAINT "productos_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_productos_v_version_variantes" ADD CONSTRAINT "_productos_v_version_variantes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_productos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_productos_v" ADD CONSTRAINT "_productos_v_parent_id_productos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."productos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_productos_v" ADD CONSTRAINT "_productos_v_version_categoria_id_categorias_id_fk" FOREIGN KEY ("version_categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_productos_v" ADD CONSTRAINT "_productos_v_version_actualizado_por_id_users_id_fk" FOREIGN KEY ("version_actualizado_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_productos_v_rels" ADD CONSTRAINT "_productos_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_productos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_productos_v_rels" ADD CONSTRAINT "_productos_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categorias" ADD CONSTRAINT "categorias_padre_id_categorias_id_fk" FOREIGN KEY ("padre_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categorias" ADD CONSTRAINT "categorias_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categorias" ADD CONSTRAINT "categorias_fondo_banda_id_media_id_fk" FOREIGN KEY ("fondo_banda_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categorias_rels" ADD CONSTRAINT "categorias_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categorias_rels" ADD CONSTRAINT "categorias_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resenas" ADD CONSTRAINT "resenas_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resenas" ADD CONSTRAINT "resenas_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pedidos_items" ADD CONSTRAINT "pedidos_items_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pedidos_items" ADD CONSTRAINT "pedidos_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "registro" ADD CONSTRAINT "registro_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_productos_fk" FOREIGN KEY ("productos_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resenas_fk" FOREIGN KEY ("resenas_id") REFERENCES "public"."resenas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pedidos_fk" FOREIGN KEY ("pedidos_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_suscriptores_fk" FOREIGN KEY ("suscriptores_id") REFERENCES "public"."suscriptores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_registro_fk" FOREIGN KEY ("registro_id") REFERENCES "public"."registro"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "productos_variantes_order_idx" ON "productos_variantes" USING btree ("_order");
  CREATE INDEX "productos_variantes_parent_id_idx" ON "productos_variantes" USING btree ("_parent_id");
  CREATE INDEX "productos_categoria_idx" ON "productos" USING btree ("categoria_id");
  CREATE UNIQUE INDEX "productos_slug_idx" ON "productos" USING btree ("slug");
  CREATE INDEX "productos_vendidos_idx" ON "productos" USING btree ("vendidos");
  CREATE INDEX "productos_actualizado_por_idx" ON "productos" USING btree ("actualizado_por_id");
  CREATE INDEX "productos_updated_at_idx" ON "productos" USING btree ("updated_at");
  CREATE INDEX "productos_created_at_idx" ON "productos" USING btree ("created_at");
  CREATE INDEX "productos__status_idx" ON "productos" USING btree ("_status");
  CREATE INDEX "productos_rels_order_idx" ON "productos_rels" USING btree ("order");
  CREATE INDEX "productos_rels_parent_idx" ON "productos_rels" USING btree ("parent_id");
  CREATE INDEX "productos_rels_path_idx" ON "productos_rels" USING btree ("path");
  CREATE INDEX "productos_rels_media_id_idx" ON "productos_rels" USING btree ("media_id");
  CREATE INDEX "_productos_v_version_variantes_order_idx" ON "_productos_v_version_variantes" USING btree ("_order");
  CREATE INDEX "_productos_v_version_variantes_parent_id_idx" ON "_productos_v_version_variantes" USING btree ("_parent_id");
  CREATE INDEX "_productos_v_parent_idx" ON "_productos_v" USING btree ("parent_id");
  CREATE INDEX "_productos_v_version_version_categoria_idx" ON "_productos_v" USING btree ("version_categoria_id");
  CREATE INDEX "_productos_v_version_version_slug_idx" ON "_productos_v" USING btree ("version_slug");
  CREATE INDEX "_productos_v_version_version_vendidos_idx" ON "_productos_v" USING btree ("version_vendidos");
  CREATE INDEX "_productos_v_version_version_actualizado_por_idx" ON "_productos_v" USING btree ("version_actualizado_por_id");
  CREATE INDEX "_productos_v_version_version_updated_at_idx" ON "_productos_v" USING btree ("version_updated_at");
  CREATE INDEX "_productos_v_version_version_created_at_idx" ON "_productos_v" USING btree ("version_created_at");
  CREATE INDEX "_productos_v_version_version__status_idx" ON "_productos_v" USING btree ("version__status");
  CREATE INDEX "_productos_v_created_at_idx" ON "_productos_v" USING btree ("created_at");
  CREATE INDEX "_productos_v_updated_at_idx" ON "_productos_v" USING btree ("updated_at");
  CREATE INDEX "_productos_v_latest_idx" ON "_productos_v" USING btree ("latest");
  CREATE INDEX "_productos_v_rels_order_idx" ON "_productos_v_rels" USING btree ("order");
  CREATE INDEX "_productos_v_rels_parent_idx" ON "_productos_v_rels" USING btree ("parent_id");
  CREATE INDEX "_productos_v_rels_path_idx" ON "_productos_v_rels" USING btree ("path");
  CREATE INDEX "_productos_v_rels_media_id_idx" ON "_productos_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_padre_idx" ON "categorias" USING btree ("padre_id");
  CREATE INDEX "categorias_imagen_idx" ON "categorias" USING btree ("imagen_id");
  CREATE INDEX "categorias_fondo_banda_idx" ON "categorias" USING btree ("fondo_banda_id");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE INDEX "categorias_rels_order_idx" ON "categorias_rels" USING btree ("order");
  CREATE INDEX "categorias_rels_parent_idx" ON "categorias_rels" USING btree ("parent_id");
  CREATE INDEX "categorias_rels_path_idx" ON "categorias_rels" USING btree ("path");
  CREATE INDEX "categorias_rels_media_id_idx" ON "categorias_rels" USING btree ("media_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_miniatura_sizes_miniatura_filename_idx" ON "media" USING btree ("sizes_miniatura_filename");
  CREATE INDEX "media_sizes_tarjeta_sizes_tarjeta_filename_idx" ON "media" USING btree ("sizes_tarjeta_filename");
  CREATE INDEX "media_sizes_poster_sizes_poster_filename_idx" ON "media" USING btree ("sizes_poster_filename");
  CREATE INDEX "resenas_producto_idx" ON "resenas" USING btree ("producto_id");
  CREATE INDEX "resenas_foto_idx" ON "resenas" USING btree ("foto_id");
  CREATE INDEX "resenas_ip_hash_idx" ON "resenas" USING btree ("ip_hash");
  CREATE INDEX "resenas_updated_at_idx" ON "resenas" USING btree ("updated_at");
  CREATE INDEX "resenas_created_at_idx" ON "resenas" USING btree ("created_at");
  CREATE INDEX "pedidos_items_order_idx" ON "pedidos_items" USING btree ("_order");
  CREATE INDEX "pedidos_items_parent_id_idx" ON "pedidos_items" USING btree ("_parent_id");
  CREATE INDEX "pedidos_items_producto_idx" ON "pedidos_items" USING btree ("producto_id");
  CREATE UNIQUE INDEX "pedidos_numero_idx" ON "pedidos" USING btree ("numero");
  CREATE INDEX "pedidos_updated_at_idx" ON "pedidos" USING btree ("updated_at");
  CREATE INDEX "pedidos_created_at_idx" ON "pedidos" USING btree ("created_at");
  CREATE UNIQUE INDEX "suscriptores_email_idx" ON "suscriptores" USING btree ("email");
  CREATE INDEX "suscriptores_ip_hash_idx" ON "suscriptores" USING btree ("ip_hash");
  CREATE INDEX "suscriptores_updated_at_idx" ON "suscriptores" USING btree ("updated_at");
  CREATE INDEX "suscriptores_created_at_idx" ON "suscriptores" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "registro_usuario_idx" ON "registro" USING btree ("usuario_id");
  CREATE INDEX "registro_updated_at_idx" ON "registro" USING btree ("updated_at");
  CREATE INDEX "registro_created_at_idx" ON "registro" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_productos_id_idx" ON "payload_locked_documents_rels" USING btree ("productos_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_resenas_id_idx" ON "payload_locked_documents_rels" USING btree ("resenas_id");
  CREATE INDEX "payload_locked_documents_rels_pedidos_id_idx" ON "payload_locked_documents_rels" USING btree ("pedidos_id");
  CREATE INDEX "payload_locked_documents_rels_suscriptores_id_idx" ON "payload_locked_documents_rels" USING btree ("suscriptores_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_registro_id_idx" ON "payload_locked_documents_rels" USING btree ("registro_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "productos_variantes" CASCADE;
  DROP TABLE "productos" CASCADE;
  DROP TABLE "productos_rels" CASCADE;
  DROP TABLE "_productos_v_version_variantes" CASCADE;
  DROP TABLE "_productos_v" CASCADE;
  DROP TABLE "_productos_v_rels" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "categorias_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "resenas" CASCADE;
  DROP TABLE "pedidos_items" CASCADE;
  DROP TABLE "pedidos" CASCADE;
  DROP TABLE "suscriptores" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "registro" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "ajustes" CASCADE;
  DROP TYPE "public"."enum_productos_variantes_talla";
  DROP TYPE "public"."enum_productos_calce";
  DROP TYPE "public"."enum_productos_genero";
  DROP TYPE "public"."enum_productos_status";
  DROP TYPE "public"."enum__productos_v_version_variantes_talla";
  DROP TYPE "public"."enum__productos_v_version_calce";
  DROP TYPE "public"."enum__productos_v_version_genero";
  DROP TYPE "public"."enum__productos_v_version_status";
  DROP TYPE "public"."enum_media_tipo";
  DROP TYPE "public"."enum_pedidos_estado";
  DROP TYPE "public"."enum_users_rol";`)
}
