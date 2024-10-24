CREATE DATABASE stock;
CREATE TABLE stock.Categories (
    CategoryID int AUTO_INCREMENT PRIMARY KEY,
    CategoryName varchar(255)
);
CREATE TABLE stock.SubCategories (
    SubCategoryID int AUTO_INCREMENT PRIMARY KEY,
    SubCategoryName varchar(255),
    CategoryId int
);
CREATE TABLE stock.Colors (
    ColorID int AUTO_INCREMENT PRIMARY KEY,
    ColorName varchar(255)
);
CREATE TABLE stock.Sizes (
    SizeID int AUTO_INCREMENT PRIMARY KEY,
    SizeName varchar(255)
);
CREATE TABLE stock.Products (
    ProductID int AUTO_INCREMENT PRIMARY KEY,
    ProductName varchar(255) NOT NULL,
    ProductCode varchar(255),
    Quantity int NOT NULL,
    ExtendedPrice int NOT NULL,
    CategoryId int NOT NULL,
    SubCategoryId int NOT NULL,
    ImageUrl varchar(255),
    ColorId int NOT NULL,
    SizeId int NOT NULL
);

insert into stock.Categories (CategoryName) values ('Alt Giyim');
insert into stock.Categories (CategoryName) values ('Üst Giyim');
insert into stock.Categories (CategoryName) values ('Diş Giyim');

insert into stock.SubCategories (SubCategoryName, CategoryId) values ('Etek', 1);
insert into stock.SubCategories (SubCategoryName, CategoryId) values ('Pantolon', 1);
insert into stock.SubCategories (SubCategoryName, CategoryId) values ('Kazak', 2);
insert into stock.SubCategories (SubCategoryName, CategoryId) values ('Gömlek', 2);
insert into stock.SubCategories (SubCategoryName, CategoryId) values ('Tişört', 2);
insert into stock.SubCategories (SubCategoryName, CategoryId) values ('Mont', 3);
insert into stock.SubCategories (SubCategoryName, CategoryId) values ('Kaban', 3);

insert into stock.Sizes (SizeName) values ('XXL');
insert into stock.Sizes (SizeName) values ('XL');
insert into stock.Sizes (SizeName) values ('L');
insert into stock.Sizes (SizeName) values ('M');
insert into stock.Sizes (SizeName) values ('S');
insert into stock.Sizes (SizeName) values ('XS');

insert into stock.Colors (ColorName) values ('Lacivert');
insert into stock.Colors (ColorName) values ('Siyah');
insert into stock.Colors (ColorName) values ('Beyaz');
insert into stock.Colors (ColorName) values ('Gri');

insert into stock.Products (ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, ImageUrl, ColorId, SizeId) values ('Midi Etek', 'E90', 851, 355, 1, 1, 'http://dummyimage.com/142x100.png/cc0000/ffffff', 1, 1);
insert into stock.Products (ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, ImageUrl, ColorId, SizeId) values ('Wide Leg Pantolon', 'P90', 38, 539, 1, 2, 'http://dummyimage.com/225x100.png/dddddd/000000', 2, 2);
insert into stock.Products (ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, ImageUrl, ColorId, SizeId) values ('Polo Yaka Tişört', 'T90', 553, 304, 2, 5, 'http://dummyimage.com/101x100.png/5fa2dd/ffffff', 3, 3);
insert into stock.Products (ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, ImageUrl, ColorId, SizeId) values ('Şişme Mont', 'M90', 192, 514, 3, 6, 'http://dummyimage.com/189x100.png/ff4444/ffffff', 4, 4);
insert into stock.Products (ProductName, ProductCode, Quantity, ExtendedPrice, CategoryId, SubCategoryId, ImageUrl, ColorId, SizeId) values ('Çizgili Gömlek', 'G90', 355, 625, 2, 4, 'http://dummyimage.com/191x100.png/dddddd/000000', 5, 4);

