using System;
using System.Linq;
using CafeShop.Model;
using CafeShop.Uitls;

namespace CafeShop.Data.Repository.Extensions
{
    public static class NewsQueryExtensions
    {
        public static IQueryable<News> Published(this IQueryable<News> query)
        {
            var now = DateTimeHelper.VietnamNow;
            return query.Where(n => !n.IsDeleted && 
                                    n.Status == NewsStatus.Published && 
                                    n.PublishedAt <= now);
        }
    }
}
