using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;

namespace CafeShop.Services.Services
{
    public class VoucherService : IVoucherService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public VoucherService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<Voucher>> GetAllAsync()
        {
            return await _unitOfWork.Voucher.GetAllAsync();
        }

        public async Task<Voucher> GetByIdAsync(int id)
        {
            return await _unitOfWork.Voucher.GetByIdAsync(id);
        }

        public async Task AddAsync(Voucher entity)
        {
            await _unitOfWork.Voucher.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(Voucher entity)
        {
            _unitOfWork.Voucher.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Voucher.GetByIdAsync(id);
            if (entity != null)
            {
                _unitOfWork.Voucher.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
