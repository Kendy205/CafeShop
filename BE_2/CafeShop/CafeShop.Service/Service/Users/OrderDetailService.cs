using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.Model;

using CafeShop.Services.IServices;

namespace CafeShop.Services.Services
{
    public class OrderDetailService : IOrderDetailService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public OrderDetailService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<OrderDetail>> GetAllAsync()
        {
            return await _unitOfWork.OrderDetail.GetAllAsync();
        }

        public async Task<OrderDetail> GetByIdAsync(int id)
        {
            return await _unitOfWork.OrderDetail.GetFirstOrDefaultAsync(p => p.OrderDetailId == id);
        }

        public async Task AddAsync(OrderDetail entity)
        {
            await _unitOfWork.OrderDetail.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(OrderDetail entity)
        {
            _unitOfWork.OrderDetail.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.OrderDetail.GetFirstOrDefaultAsync(p => p.OrderDetailId == id);
            if (entity != null)
            {
                _unitOfWork.OrderDetail.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
