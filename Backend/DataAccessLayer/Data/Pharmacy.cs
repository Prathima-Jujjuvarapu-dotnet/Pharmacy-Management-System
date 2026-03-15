using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Models;

namespace PharmacyManagement.Data
{
    public class Pharmacy : DbContext
    {
        //public Pharmacy() { }
        public Pharmacy(DbContextOptions<Pharmacy> options) : base(options) { }

        // 🔹 User & Admin
        public DbSet<User> Users { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Doctor> Doctors { get; set; }

        // 🔹 Drugs & Suppliers
        public DbSet<Drug> Drugs { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<SupplierDrug> SupplierDrugs { get; set; } // Many-to-Many Relationship

        // 🔹 Inventory & Sales
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Sales> SalesRecords { get; set; }

        // 🔹 Orders & Payments
        public DbSet<ChatHistory> ChatHistories { get; set; }
        public DbSet<UserReactivationToken> UserReactivationTokens { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<OtpRecords> OtpRecords { get; set; }
        public DbSet<StockAlert> StockAlerts { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }// For low stock alerts
        public DbSet<QrLoginSession> QrLoginSessions { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<RestockRequest> RestockRequests { get; set; }
        public DbSet<Review> Reviews { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 🔹 User & Admin Relationship (1:1)
            modelBuilder.Entity<UserReactivationToken>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId);

            modelBuilder.Entity<Doctor>()
               .HasOne(d => d.User)
               .WithOne(u => u.Doctor)
               .HasForeignKey<Doctor>(d => d.UserId)
               .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasOne(u => u.UserProfile)
                .WithOne(p => p.User)
                .HasForeignKey<UserProfile>(p => p.UserId);

            // ✅ Admin & User (1:1)
            modelBuilder.Entity<Admin>()
                .HasOne(a => a.User)
                .WithOne(u => u.Admin)
                .HasForeignKey<Admin>(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ Supplier-Drug Many-to-Many Relationship
            modelBuilder.Entity<SupplierDrug>()
                .HasKey(sd => new { sd.SupplierId, sd.DrugId });

            modelBuilder.Entity<SupplierDrug>()
                .HasOne(sd => sd.Supplier)
                .WithMany()
                .HasForeignKey(sd => sd.SupplierId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SupplierDrug>()
                .HasOne(sd => sd.Drug)
                .WithMany()
                .HasForeignKey(sd => sd.DrugId)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ Order & Doctor (Many-to-One)
            modelBuilder.Entity<Order>()
                .HasOne<Doctor>()
                .WithMany(d => d.Orders)
                .HasForeignKey(o => o.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ Payment & Order (Many-to-One)
            //modelBuilder.Entity<Payment>()
            //    .HasOne(p => p.Order)
            //    .WithMany()
            //    .HasForeignKey(p => p.OrderId)
            //    .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Payment>()
           .HasOne(p => p.Order)
           .WithMany()
           .HasForeignKey(p => p.OrderId)
           .OnDelete(DeleteBehavior.Restrict);  // 🚀 Prevents multiple cascade paths

            // ✅ Configure Payment - Doctor Relationship
            //modelBuilder.Entity<Payment>()
            //    .HasOne<Doctor>()
            //    .WithMany()
            //    .HasForeignKey(p => p.DoctorId)
            //    .OnDelete(DeleteBehavior.Restrict);
        }
    }

}
