#include <iostream>
#include <string>
using namespace std;

// ─────────────────────────────────────────
//  BASE CLASS — Product
// ─────────────────────────────────────────
class Product {
protected:
    int productID;
    string productName;
    int stockLevel;
    int pastSales;      // total past sales (units)
    int months;         // number of months of sales data
    int leadTimeDays;   // days to restock

public:
    Product(int id, string name, int stock, int sales, int mo, int lead) {
        productID    = id;
        productName  = name;
        stockLevel   = stock;
        pastSales    = sales;
        months       = mo;
        leadTimeDays = lead;
    }

    // Base forecast formula:
    // Forecast = (Avg Monthly Sales x Lead Time Factor) + Safety Stock
    // Lead Time Factor = leadTimeDays / 30
    // Safety Stock     = stockLevel x 0.2
    virtual int calculateDemand() {
        float avgMonthlySales = (float)pastSales / months;
        float leadTimeFactor  = (float)leadTimeDays / 30;
        float safetyStock     = stockLevel * 0.2;
        int forecast = (int)((avgMonthlySales * leadTimeFactor) + safetyStock);
        return forecast;
    }

    virtual void displayInfo() {
        cout << "  Product ID     : " << productID << endl;
        cout << "  Product Name   : " << productName << endl;
        cout << "  Stock Level    : " << stockLevel << " units" << endl;
        cout << "  Past Sales     : " << pastSales << " units over " << months << " months" << endl;
        cout << "  Lead Time      : " << leadTimeDays << " days" << endl;
    }

    virtual void displayForecast() {
        cout << "  >> Forecast for " << productName << " : "
             << calculateDemand() << " units" << endl;
    }

    string getName() { return productName; }
    virtual ~Product() {}
};

// ─────────────────────────────────────────
//  CHILD CLASS — RawMaterial
//  Formula: Base x 1.5 (aggressive restocking — raw materials are critical)
// ─────────────────────────────────────────
class RawMaterial : public Product {
private:
    string materialType;

public:
    RawMaterial(int id, string name, int stock, string type, int sales, int mo, int lead)
        : Product(id, name, stock, sales, mo, lead) {
        materialType = type;
    }

    int calculateDemand() override {
        float avgMonthlySales = (float)pastSales / months;
        float leadTimeFactor  = (float)leadTimeDays / 30;
        float safetyStock     = stockLevel * 0.2;
        // Raw materials need aggressive buffer — multiply by 1.5
        int forecast = (int)(((avgMonthlySales * leadTimeFactor) + safetyStock) * 1.5);
        return forecast;
    }

    void displayInfo() override {
        Product::displayInfo();
        cout << "  Material Type  : " << materialType << endl;
        cout << "  Category       : Raw Material" << endl;
    }

    void displayForecast() override {
        cout << "  Formula  : (Avg Sales x Lead Time Factor + Safety Stock) x 1.5" << endl;
        cout << "  Avg Monthly Sales = " << pastSales << " / " << months
             << " = " << (float)pastSales/months << endl;
        cout << "  Lead Time Factor  = " << leadTimeDays << " / 30 = "
             << (float)leadTimeDays/30 << endl;
        cout << "  Safety Stock      = " << stockLevel << " x 0.2 = "
             << stockLevel * 0.2 << endl;
        cout << "  >> Forecast for " << productName << " : "
             << calculateDemand() << " units" << endl;
    }
};

// ─────────────────────────────────────────
//  CHILD CLASS — FinishedGood
//  Formula: Base + (Customer Review Boost)
//  Review score 0-5: adds up to 20% extra demand if well reviewed
// ─────────────────────────────────────────
class FinishedGood : public Product {
protected:
    string packaging;
    float reviewScore;  // optional, 0.0 to 5.0

public:
    FinishedGood(int id, string name, int stock, string pkg, int sales, int mo, int lead, float review = 0)
        : Product(id, name, stock, sales, mo, lead) {
        packaging   = pkg;
        reviewScore = review;
    }

    int calculateDemand() override {
        float avgMonthlySales = (float)pastSales / months;
        float leadTimeFactor  = (float)leadTimeDays / 30;
        float safetyStock     = stockLevel * 0.2;
        float base            = (avgMonthlySales * leadTimeFactor) + safetyStock;
        // Review boost: each point above 3.0 adds 4% extra demand
        float reviewBoost = 0;
        if (reviewScore > 3.0)
            reviewBoost = base * ((reviewScore - 3.0) * 0.04);
        int forecast = (int)(base + reviewBoost);
        return forecast;
    }

    void displayInfo() override {
        Product::displayInfo();
        cout << "  Packaging      : " << packaging << endl;
        cout << "  Review Score   : " << reviewScore << " / 5.0" << endl;
        cout << "  Category       : Finished Good" << endl;
    }

    void displayForecast() override {
        float avgMonthlySales = (float)pastSales / months;
        float leadTimeFactor  = (float)leadTimeDays / 30;
        float safetyStock     = stockLevel * 0.2;
        float base            = (avgMonthlySales * leadTimeFactor) + safetyStock;
        float reviewBoost     = 0;
        if (reviewScore > 3.0)
            reviewBoost = base * ((reviewScore - 3.0) * 0.04);
        cout << "  Formula  : (Avg Sales x Lead Time Factor + Safety Stock) + Review Boost" << endl;
        cout << "  Avg Monthly Sales = " << pastSales << " / " << months
             << " = " << avgMonthlySales << endl;
        cout << "  Lead Time Factor  = " << leadTimeDays << " / 30 = " << leadTimeFactor << endl;
        cout << "  Safety Stock      = " << stockLevel << " x 0.2 = " << safetyStock << endl;
        cout << "  Review Boost      = " << reviewBoost << " units (score: " << reviewScore << ")" << endl;
        cout << "  >> Forecast for " << productName << " : "
             << calculateDemand() << " units" << endl;
    }
};

// ─────────────────────────────────────────
//  GRANDCHILD — SeasonalProduct
//  Formula: Base x Season Factor (1.0 to 2.0)
// ─────────────────────────────────────────
class SeasonalProduct : public FinishedGood {
private:
    string peakSeason;
    float seasonFactor; // 1.0 = normal, 2.0 = double demand in peak season

public:
    SeasonalProduct(int id, string name, int stock, string pkg,
                    string season, float sf, int sales, int mo, int lead, float review = 0)
        : FinishedGood(id, name, stock, pkg, sales, mo, lead, review) {
        peakSeason   = season;
        seasonFactor = sf;
    }

    int calculateDemand() override {
        float avgMonthlySales = (float)pastSales / months;
        float leadTimeFactor  = (float)leadTimeDays / 30;
        float safetyStock     = stockLevel * 0.2;
        float base            = (avgMonthlySales * leadTimeFactor) + safetyStock;
        // Season factor multiplies entire demand
        int forecast = (int)(base * seasonFactor);
        return forecast;
    }

    void displayInfo() override {
        FinishedGood::displayInfo();
        cout << "  Peak Season    : " << peakSeason << endl;
        cout << "  Season Factor  : " << seasonFactor << "x" << endl;
        cout << "  Type           : Seasonal Product" << endl;
    }

    void displayForecast() override {
        float avgMonthlySales = (float)pastSales / months;
        float leadTimeFactor  = (float)leadTimeDays / 30;
        float safetyStock     = stockLevel * 0.2;
        float base            = (avgMonthlySales * leadTimeFactor) + safetyStock;
        cout << "  Formula  : (Avg Sales x Lead Time Factor + Safety Stock) x Season Factor" << endl;
        cout << "  Avg Monthly Sales = " << pastSales << " / " << months
             << " = " << avgMonthlySales << endl;
        cout << "  Lead Time Factor  = " << leadTimeDays << " / 30 = " << leadTimeFactor << endl;
        cout << "  Safety Stock      = " << stockLevel << " x 0.2 = " << safetyStock << endl;
        cout << "  Season Factor     = " << seasonFactor << "x  (Peak: " << peakSeason << ")" << endl;
        cout << "  >> Forecast for " << productName << " : "
             << calculateDemand() << " units" << endl;
    }
};

// ─────────────────────────────────────────
//  GRANDCHILD — RegularProduct
//  Formula: Pure base formula — no extra factors
// ─────────────────────────────────────────
class RegularProduct : public FinishedGood {
public:
    RegularProduct(int id, string name, int stock, string pkg, int sales, int mo, int lead, float review = 0)
        : FinishedGood(id, name, stock, pkg, sales, mo, lead, review) {}

    int calculateDemand() override {
        float avgMonthlySales = (float)pastSales / months;
        float leadTimeFactor  = (float)leadTimeDays / 30;
        float safetyStock     = stockLevel * 0.2;
        int forecast = (int)((avgMonthlySales * leadTimeFactor) + safetyStock);
        return forecast;
    }

    void displayInfo() override {
        FinishedGood::displayInfo();
        cout << "  Type           : Regular Product" << endl;
    }

    void displayForecast() override {
        float avgMonthlySales = (float)pastSales / months;
        float leadTimeFactor  = (float)leadTimeDays / 30;
        float safetyStock     = stockLevel * 0.2;
        cout << "  Formula  : Avg Sales x Lead Time Factor + Safety Stock" << endl;
        cout << "  Avg Monthly Sales = " << pastSales << " / " << months
             << " = " << avgMonthlySales << endl;
        cout << "  Lead Time Factor  = " << leadTimeDays << " / 30 = " << leadTimeFactor << endl;
        cout << "  Safety Stock      = " << stockLevel << " x 0.2 = " << safetyStock << endl;
        cout << "  >> Forecast for " << productName << " : "
             << calculateDemand() << " units" << endl;
    }
};

// ─────────────────────────────────────────
//  ENCAPSULATION — DemandForecast Class
// ─────────────────────────────────────────
class DemandForecast {
private:
    int forecastValue;
    string productName;

public:
    DemandForecast(string name, int calculatedValue) {
        productName   = name;
        forecastValue = 0;
        updateForecast(calculatedValue);
    }

    void updateForecast(int value) {
        if (value > 0) {
            forecastValue = value;
            cout << "  Forecast set successfully for " << productName << "!" << endl;
        } else {
            cout << "  Invalid forecast value! Must be > 0." << endl;
        }
    }

    int getForecast() { return forecastValue; }

    void displayForecast() {
        cout << "  Product        : " << productName << endl;
        cout << "  Forecast Qty   : " << forecastValue << " units" << endl;
    }
};

// ─────────────────────────────────────────
//  Order & Supplier Classes
// ─────────────────────────────────────────
class Order {
private:
    int orderID;
    string productName;
    int quantity;
    string orderDate;
public:
    Order(int id, string name, int qty, string date)
        : orderID(id), productName(name), quantity(qty), orderDate(date) {}
    void displayOrder() {
        cout << "  Order ID       : " << orderID << endl;
        cout << "  Product        : " << productName << endl;
        cout << "  Quantity       : " << quantity << " units" << endl;
        cout << "  Order Date     : " << orderDate << endl;
    }
};

class Supplier {
private:
    int supplierID;
    string supplierName;
    string contact;
public:
    Supplier(int id, string name, string c)
        : supplierID(id), supplierName(name), contact(c) {}
    void displaySupplier() {
        cout << "  Supplier ID    : " << supplierID << endl;
        cout << "  Name           : " << supplierName << endl;
        cout << "  Contact        : " << contact << endl;
    }
};

// ─────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────
int main() {
    cout << "========================================" << endl;
    cout << "   DEMAND FORECASTING SYSTEM (OOP)     " << endl;
    cout << "========================================" << endl;

    // Create objects
    // RawMaterial   (id, name, stock, type, pastSales, months, leadDays)
    // FinishedGood  (id, name, stock, pkg,  pastSales, months, leadDays, reviewScore)
    // SeasonalProduct(id, name, stock, pkg, season, seasonFactor, pastSales, months, leadDays, review)
    // RegularProduct (id, name, stock, pkg, pastSales, months, leadDays, review)

    RawMaterial     r1(101, "Steel Rod",      500, "Metal",        1200, 6, 15);
    FinishedGood    f1(202, "Gear Box",        150, "Wooden Crate", 900,  6, 20, 4.2);
    SeasonalProduct s1(303, "Festival Light",  300, "Box", "Diwali/Christmas", 1.8, 600, 6, 10, 4.7);
    RegularProduct  rp1(404, "Bolt Set",      1000, "Plastic Bag", 1500, 6, 7,  3.5);

    // --- Product Info ---
    cout << "\n[ Product Details ]" << endl;

    cout << "\n--- Raw Material ---" << endl;
    r1.displayInfo();

    cout << "\n--- Finished Good ---" << endl;
    f1.displayInfo();

    cout << "\n--- Seasonal Product ---" << endl;
    s1.displayInfo();

    cout << "\n--- Regular Product ---" << endl;
    rp1.displayInfo();

    // --- Forecast Calculations (Polymorphism) ---
    cout << "\n========================================" << endl;
    cout << "[ Forecast Calculations — Polymorphism ]" << endl;
    cout << "========================================" << endl;

    Product* products[4] = { &r1, &f1, &s1, &rp1 };
    string labels[4] = { "Raw Material", "Finished Good", "Seasonal Product", "Regular Product" };

    for (int i = 0; i < 4; i++) {
        cout << "\n>> " << labels[i] << " (" << products[i]->getName() << ")" << endl;
        products[i]->displayForecast();
    }

    // --- Encapsulation: Store forecasts safely ---
    cout << "\n========================================" << endl;
    cout << "[ Encapsulation — Storing Forecasts ]" << endl;
    cout << "========================================" << endl;
    cout << endl;

    DemandForecast df1("Steel Rod",      r1.calculateDemand());
    DemandForecast df2("Gear Box",       f1.calculateDemand());
    DemandForecast df3("Festival Light", s1.calculateDemand());
    DemandForecast df4("Bolt Set",       rp1.calculateDemand());

    cout << "\n  Stored Forecast Summary:" << endl;
    cout << "  ------------------------" << endl;
    df1.displayForecast();
    df2.displayForecast();
    df3.displayForecast();
    df4.displayForecast();

    // --- Orders ---
    cout << "\n========================================" << endl;
    cout << "[ Orders ]" << endl;
    cout << "========================================" << endl;

    Order o1(1, "Steel Rod",      r1.calculateDemand(),  "2024-03-01");
    Order o2(2, "Festival Light", s1.calculateDemand(),  "2024-10-15");

    cout << "\n Order 1:" << endl; o1.displayOrder();
    cout << "\n Order 2:" << endl; o2.displayOrder();

    // --- Suppliers ---
    cout << "\n========================================" << endl;
    cout << "[ Suppliers ]" << endl;
    cout << "========================================" << endl;

    Supplier sup1(1, "ABC Metals Pvt Ltd", "9876543210");
    Supplier sup2(2, "XYZ Electricals",    "9123456780");

    cout << "\n Supplier 1:" << endl; sup1.displaySupplier();
    cout << "\n Supplier 2:" << endl; sup2.displaySupplier();

    cout << "\n========================================" << endl;
    cout << "        END OF SYSTEM OUTPUT            " << endl;
    cout << "========================================" << endl;

    return 0;
}

---

# DemandFlow - Smart Demand Forecasting & Request Management

A modern, fully functional web application for managing demand requests across products, resources, and supply chains. Built with clean HTML, CSS, and JavaScript.

![DemandFlow](https://img.shields.io/badge/DemandFlow-v1.0-4f46e5?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Features

- **Submit Demand Requests** — Intuitive form supporting three request types:
  - Product & Inventory demands
  - Resource & Staffing requests
  - Supply Chain requirements

- **Interactive Dashboard** — View, filter, search, and manage all requests with real-time status tracking (Pending, In Review, Approved, Rejected)

- **Analytics & Forecasting** — Rich charts and visualizations powered by Chart.js:
  - Requests by type (doughnut chart)
  - Status distribution
  - Priority breakdown
  - Monthly demand trends with forecast line
  - Department-level analysis

- **Modern UI** — Dark theme with glass-morphism effects, smooth animations, and fully responsive design

- **Persistent Data** — All data stored in localStorage, persists across sessions

- **Sample Data** — Pre-loaded with 6 realistic demo requests to explore immediately

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Landing page with hero, features, and request type overview |
| `submit.html` | Demand request submission form with validation |
| `dashboard.html` | Request management dashboard with filtering and status controls |
| `analytics.html` | Analytics dashboard with interactive charts and forecasting |
| `about.html` | About page with mission, team, and contact form |

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/lakshanasri-23/Demand-Forecast-.git
   ```

2. Open `index.html` in your browser — no build tools or server required!

   Or use a local server:
   ```bash
   # Python
   python3 -m http.server 8000

   # Node.js
   npx serve .
   ```

3. Navigate to `http://localhost:8000` and start exploring.

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **JavaScript** — Vanilla ES5+ (no frameworks)
- **Chart.js** — Interactive chart visualizations (CDN)
- **Font Awesome** — Icon library (CDN)
- **Google Fonts** — Inter typeface (CDN)

## Project Structure

```
Demand-Forecast-/
├── index.html          # Landing page
├── submit.html         # Submit request form
├── dashboard.html      # Request management dashboard
├── analytics.html      # Analytics & forecasting
├── about.html          # About & contact page
├── css/
│   └── styles.css      # Complete design system & styles
├── js/
│   ├── data.js         # Data layer (localStorage CRUD)
│   ├── app.js          # Shared app logic (nav, toasts, utils)
│   ├── submit.js       # Form submission & validation
│   ├── dashboard.js    # Dashboard rendering & filtering
│   └── analytics.js    # Chart rendering & analytics
└── README.md
```

## Author

**Lakshanasri** — [GitHub](https://github.com/lakshanasri-23)

## License

This project is open source and available under the [MIT License](LICENSE).
