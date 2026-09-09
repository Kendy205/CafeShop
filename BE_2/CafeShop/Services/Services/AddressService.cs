using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;

namespace CafeShop.Services.Services
{
    public class AddressService : IAddressService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AddressService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<Address>> GetAllAsync()
        {
            return await _unitOfWork.Address.GetAllAsync();
        }

        public async Task<Address> GetByIdAsync(int id)
        {
            return await _unitOfWork.Address.GetByIdAsync(id);
        }

        public async Task AddAsync(Address entity)
        {
            await _unitOfWork.Address.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(Address entity)
        {
            _unitOfWork.Address.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Address.GetByIdAsync(id);
            if (entity != null)
            {
                _unitOfWork.Address.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
