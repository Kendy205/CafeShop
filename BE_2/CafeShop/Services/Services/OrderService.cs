using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;

namespace CafeShop.Services.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await _unitOfWork.Order.GetAllAsync();
        }

        public async Task<Order> GetByIdAsync(int id)
        {
            return await _unitOfWork.Order.GetByIdAsync(id);
        }

        public async Task AddAsync(Order entity)
        {
            await _unitOfWork.Order.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(Order entity)
        {
            _unitOfWork.Order.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Order.GetByIdAsync(id);
            if (entity != null)
            {
                _unitOfWork.Order.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
