using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Size;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.Services
{
    public class SizeService : ISizeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SizeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<SizeDto>> GetAllSizesAsync()
        {
            var sizes = await _unitOfWork.Size.GetAllAsync();
            return _mapper.Map<List<SizeDto>>(sizes);
        }
    }
}
