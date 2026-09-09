using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;

namespace CafeShop.Services.Services
{
    public class OrderDetailToppingService : IOrderDetailToppingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public OrderDetailToppingService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<OrderDetailTopping>> GetAllAsync()
        {
            return await _unitOfWork.OrderDetailTopping.GetAllAsync();
        }

        public async Task<OrderDetailTopping> GetByIdAsync(int id)
        {
            return await _unitOfWork.OrderDetailTopping.GetFirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(OrderDetailTopping entity)
        {
            await _unitOfWork.OrderDetailTopping.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(OrderDetailTopping entity)
        {
            _unitOfWork.OrderDetailTopping.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.OrderDetailTopping.GetFirstOrDefaultAsync(p => p.Id == id);
            if (entity != null)
            {
                _unitOfWork.OrderDetailTopping.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
