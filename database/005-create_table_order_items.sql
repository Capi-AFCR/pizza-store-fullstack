CREATE TABLE public.order_items (
	order_id int8 NOT NULL,
	price float8 NOT NULL,
	product_id int8 NOT NULL,
	quantity int4 NOT NULL,
	CONSTRAINT fkbioxgbv59vetrxe0ejfubep1w FOREIGN KEY (order_id) REFERENCES public.orders(id)
);